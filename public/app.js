// Function to fetch and process data from 'data.json'
async function fetchData() {
  try {
      const response = await fetch('data.json');
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}


/////////////////////////////////////////////////////////////////
// 2025.06.02: run fetchConstants only once instead of 3 times
////////////////////////////////////////////////////////////////////
let cachedConstants; // Cache for reuse

// Function to fetch and process constants from 'constants.json'
async function fetchConstants() {
  try {
      // retrieve from cache if cachedConstants exists
      if(cachedConstants) {
        return cachedConstants;
      }
      else {
      const response = await fetch('constants.json');
      const data = await response.json();
      return data;
      }
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}
/////////////////////////////////////////////////////////////////



//Function to fetch constants and populate pot type dropdown menu
async function populatePottype() {
  const data = await fetchConstants();
  if (!data) return;

  const dropdown = document.getElementById("potType");
  for (let i = 0; i < data.length; i++) {
    if(data[i].datatype === "pot") {
      var option = document.createElement("option");
      option.text = data[i].name;
      option.value = data[i].name;
      dropdown.add(option);
    }
  }
}

//Function to fetch constants and populate plant type dropdown menu
async function populatePlantType() {
  const data = await fetchConstants();
  if (!data) return;

  const dropdown = document.getElementById("plantType");
  for (let i = 0; i < data.length; i++) {
    if(data[i].datatype === "species") {
      var option = document.createElement("option");
      option.text = data[i].name;
      option.value = data[i].name;
      dropdown.add(option);
    }
  }
}

//Function to fetch constants and populate season dropdown menu
async function populateSeason() {
  const data = await fetchConstants();
  if (!data) return;

  const dropdown = document.getElementById("season");
  for (let i = 0; i < data.length; i++) {
    if(data[i].datatype === "season") {
      var option = document.createElement("option");
      option.text = data[i].name;
      option.value = data[i].name;
      dropdown.add(option);
    }
  }
}

function initialize() {
  populatePottype()
  populatePlantType()
  populateSeason()

}
function calculatePotVolume(diameter, height) {
  const radius = diameter / 2;
  return Math.PI * Math.pow(radius, 2) * height;
}

//Function to calculate water and fertilizer recommendations
async function calculateRecommendations(potVolume, potType, plantType, season) {
  const data = await fetchConstants();
  if (!data) return;

  let potdata
  let speciesdata
  let seasondata


  ////////////////////////////////////////////////////////////////////
  // 2025.06.02 combine 3 for loops into 1
  ////////////////////////////////////////////////////////////////////
  for (let i = 0; i < data.length; i++) {
    if(data[i].datatype === "pot" && data[i].name === potType) {
      potdata = data[i]
    }

    if(data[i].datatype === "species" && data[i].name === plantType) {
      speciesdata = data[i]
    }

    if(data[i].datatype === "season" && data[i].name === season) {
      seasondata = data[i]
    }
  } 
  ////////////////////////////////////////////////////////////////////

  
 
  let water = potVolume * 0.0001 *potdata.datafield_1*seasondata.datafield_1
  let fertilizer = water * seasondata.datafield_2

  document.getElementById('recommendedWater').textContent = `${water.toFixed(1)} liters`;
  document.getElementById('recommendedFertilizer').textContent = `${fertilizer.toFixed(2)} units`;
}



// Function to search recommendations data and calculate statistics based on it and user inputs
async function findRecommendations(potVolume, potType, plantType, season) {
  const data = await fetchData();
  if (!data) return;

  ///////////////////////////////////////////////
  // 2025.06.03 Merge multiple for loops for findRecommendations
  ////////////////////////////////////////////////
  // used in 1st IF-block
  let similarCount = 0
  // used in 2nd IF-block
  let morewaterCount = 0
  let morewaterGrowthSum = 0
  let morewaterYieldSum = 0
  // used in 3rd IF-block
  let similarwaterCount = 0
  let similarwaterGrowthSum = 0
  let similarwaterYieldSum = 0
  // used in 4th IF-block
  let lesswaterCount = 0
  let lesswaterGrowthSum = 0
  let lesswaterYieldSum = 0
  
  for (let i = 0; i < data.length; i++) {

    // keep as the 1st IF-block
    // 1st 5 conditions
    if(data[i].pot_type === potType && 
      data[i].plant_type === plantType && 
      data[i].time_of_year === season &&
      data[i].pot_volume > (potVolume * 0.9) && 
      data[i].pot_volume > (potVolume * 1.1)) {
        similarCount = similarCount + 1

        // move original 4th IF-block up to 2nd IF-block
        // then NEST under the 1st IF-block (reusing the 1st 5 conditions)
        // 1st 5 conditions + 1 actual_water vs recommented_water condition
        if(data[i].actual_water >=  (data[i].recommented_water * 1.1)) {
            morewaterCount = morewaterCount + 1
            morewaterGrowthSum = morewaterGrowthSum + data[i].growth_rate
            morewaterYieldSum = morewaterYieldSum + data[i].crop_yield

            
            // move original 2nd IF-block down to 3rd IF-block
            // then NEST under the new 2nd IF-block (reusing all 6 conditions)
            // 1st 5 conditions + 2 actual_water vs recommented_water conditions
            if(data[i].actual_water >  (data[i].recommented_water * 0.9) && 
              data[i].actual_water >  (data[i].recommented_water * 1.1)) {
                similarwaterCount = similarwaterCount + 1
                similarwaterGrowthSum = similarwaterGrowthSum + data[i].growth_rate
                similarwaterYieldSum = similarwaterYieldSum + data[i].crop_yield
            }
        }


        // move original 3rd IF-block down to 4th IF-block
        // then NEST under the 1st IF-block (reusing the 1st 5 conditions)
        // 1st 5 conditions + 1 actual_water vs recommented_water condition
        if(data[i].actual_water <=  (data[i].recommented_water * 0.9) ) {
            lesswaterCount = lesswaterCount + 1
            lesswaterGrowthSum = lesswaterGrowthSum + data[i].growth_rate
            lesswaterYieldSum = lesswaterYieldSum + data[i].crop_yield
        }
    }
  }
  
  // assignment from 1st IF-block
  document.getElementById('similar').textContent = similarCount;
  // assignment from 2nd IF-block
  document.getElementById('morewaterCount').textContent = morewaterCount;
  document.getElementById('morewaterGrowthAverage').textContent = morewaterCount ? (morewaterGrowthSum / morewaterCount).toFixed(1):"-";
  document.getElementById('morewaterYieldAverage').textContent = morewaterCount ? (morewaterYieldSum / morewaterCount).toFixed(1):"-";
  // assignment from 3rd IF-block
  document.getElementById('similarwaterCount').textContent = similarwaterCount;
  document.getElementById('similarwaterGrowthAverage').textContent = similarwaterCount ? (similarwaterGrowthSum / similarwaterCount).toFixed(1) : "-";
  document.getElementById('similarwaterYieldAverage').textContent = similarwaterCount ? (similarwaterYieldSum / similarwaterCount).toFixed(1):"-";
  // assignment from 4th IF-block
  document.getElementById('lesswaterCount').textContent = lesswaterCount;
  document.getElementById('lesswaterGrowthAverage').textContent = lesswaterCount ?(lesswaterGrowthSum / lesswaterCount).toFixed(1): "-";
  document.getElementById('lesswaterYieldAverage').textContent = lesswaterCount ? (lesswaterYieldSum / lesswaterCount).toFixed(1):"-";
 
  ///////////////////////////////////////////////

  let outputSection = document.getElementById("outputSection");
  outputSection.style.display = "block";
}

// Event listener for the calculate button
document.getElementById('calculateButton').addEventListener('click', function() {
  const potType = document.getElementById('potType').value;
  const potDiameter = parseFloat(document.getElementById('potDiameter').value);
  const potHeight = parseFloat(document.getElementById('potHeight').value);
  const plantType = document.getElementById('plantType').value;
  const season = document.getElementById('season').value;

  // Calculate pot volume (if needed in your logic)
  const potVolume = calculatePotVolume(potDiameter, potHeight);
  document.getElementById('potSize').textContent = (potVolume/1000).toFixed(1);

  calculateRecommendations(potVolume, potType, plantType, season)

  // Find and display recommendations and statistics
  findRecommendations(potVolume, potType, plantType, season);
});
