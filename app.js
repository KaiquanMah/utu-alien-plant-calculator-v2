// Function to fetch and process data from 'data.json'
async function fetchData() {
  try {

      // 2025.06.03 cache data.json (large dataset)
      const cached = localStorage.getItem('data');
      if (cached) {
        return JSON.parse(cached);
      }
      else {
        const response = await fetch('data.json');
        const data = await response.json();
        localStorage.setItem('data', JSON.stringify(data));
        return data;
      }
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}


/////////////////////////////////////////////////////////////////
// 2025.06.02: run fetchConstants only once instead of 3 times
////////////////////////////////////////////////////////////////////

// Function to fetch and process constants from 'constants.json'
async function fetchConstants() {
  try {
      // 2025.06.02-03 retrieve from cache if cachedConstants exists
      // Check localStorage first
      const cached = localStorage.getItem('constants');
      if (cached) {
        return JSON.parse(cached); // Use cached data
      }
      else {
      const response = await fetch('constants.json');
      const data = await response.json();

      // Cache constants in localStorage
      localStorage.setItem('constants', JSON.stringify(data));
      return data;
      }
  } catch (error) {
      console.error('Error fetching constants:', error);
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

  // 2025.06.03: filter huge dataset before looping
  const filtered = data.filter(entry => 
    entry.pot_type === potType &&
    entry.plant_type === plantType &&
    entry.time_of_year === season &&
    entry.pot_volume > potVolume * 0.9 &&
    entry.pot_volume < potVolume * 1.1
  );

  if (!data) return;

  ///////////////////////////////////////////////
  // 2025.06.03 Merge multiple for loops for findRecommendations
  ////////////////////////////////////////////////
  // Approach 1 - assign statistics values 1 by 1
  // // used in 1st IF-block
  // let similarCount = 0
  // // used in 2nd IF-block
  // let morewaterCount = 0
  // let morewaterGrowthSum = 0
  // let morewaterYieldSum = 0
  // // used in 3rd IF-block
  // let similarwaterCount = 0
  // let similarwaterGrowthSum = 0
  // let similarwaterYieldSum = 0
  // // used in 4th IF-block
  // let lesswaterCount = 0
  // let lesswaterGrowthSum = 0
  // let lesswaterYieldSum = 0
  // Approach 2 - Collect statistics at 1 go
  const stats = {
    similar: 0,
    morewater: { count: 0, growthSum: 0, yieldSum: 0 },
    similarwater: { count: 0, growthSum: 0, yieldSum: 0 },
    lesswater: { count: 0, growthSum: 0, yieldSum: 0 }
  };
  

  // Approach 1 - condensed for loop
  // for (let i = 0; i < data.length; i++) {

  //   // keep as the 1st IF-block
  //   // 1st 5 conditions
  //   if(data[i].pot_type === potType && 
  //     data[i].plant_type === plantType && 
  //     data[i].time_of_year === season &&
  //     data[i].pot_volume > (potVolume * 0.9) && 
  //     data[i].pot_volume > (potVolume * 1.1)) {
  //       similarCount = similarCount + 1

  //       // move original 4th IF-block up to 2nd IF-block
  //       // then NEST under the 1st IF-block (reusing the 1st 5 conditions)
  //       // 1st 5 conditions + 1 actual_water vs recommented_water condition
  //       if(data[i].actual_water >=  (data[i].recommented_water * 1.1)) {
  //           morewaterCount = morewaterCount + 1
  //           morewaterGrowthSum = morewaterGrowthSum + data[i].growth_rate
  //           morewaterYieldSum = morewaterYieldSum + data[i].crop_yield

            
  //           // move original 2nd IF-block down to 3rd IF-block
  //           // then NEST under the new 2nd IF-block (reusing all 6 conditions)
  //           // 1st 5 conditions + 2 actual_water vs recommented_water conditions
  //           if(data[i].actual_water >  (data[i].recommented_water * 0.9) && 
  //             data[i].actual_water >  (data[i].recommented_water * 1.1)) {
  //               similarwaterCount = similarwaterCount + 1
  //               similarwaterGrowthSum = similarwaterGrowthSum + data[i].growth_rate
  //               similarwaterYieldSum = similarwaterYieldSum + data[i].crop_yield
  //           }
  //       }


  //       // move original 3rd IF-block down to 4th IF-block
  //       // then NEST under the 1st IF-block (reusing the 1st 5 conditions)
  //       // 1st 5 conditions + 1 actual_water vs recommented_water condition
  //       if(data[i].actual_water <=  (data[i].recommented_water * 0.9) ) {
  //           lesswaterCount = lesswaterCount + 1
  //           lesswaterGrowthSum = lesswaterGrowthSum + data[i].growth_rate
  //           lesswaterYieldSum = lesswaterYieldSum + data[i].crop_yield
  //       }
  //   }
  // }

  // Approach 2 - condensed for loop further, after filtering huge dataset earlier
  filtered.forEach(entry => {
    stats.similar++;

    // water use
    if (entry.actual_water >= entry.recommended_water * 1.1) {
      stats.morewater.count++;
      stats.morewater.growthSum += entry.growth_rate;
      stats.morewater.yieldSum += entry.crop_yield;
    } 
    else if (entry.actual_water >  (entry.recommented_water * 0.9) && 
              entry.actual_water >  (entry.recommented_water * 1.1)) {
      stats.similarwater.count++;
      stats.similarwater.growthSum += entry.growth_rate;
      stats.similarwater.yieldSum += entry.crop_yield;
    } 
    else if (entry.actual_water <= entry.recommended_water * 0.9) {
      stats.lesswater.count++;
      stats.lesswater.growthSum += entry.growth_rate;
      stats.lesswater.yieldSum += entry.crop_yield;
    }
  }
  );
  

  // assignment from 1st IF-block
  document.getElementById('similar').textContent = stats.similar;
  // assignment from 2nd IF-block
  document.getElementById('morewaterCount').textContent = stats.morewater.count;
  document.getElementById('morewaterGrowthAverage').textContent = stats.morewater.count ? (stats.morewater.growthSum / stats.morewater.count).toFixed(1):"-";
  document.getElementById('morewaterYieldAverage').textContent = stats.morewater.count ? (stats.morewater.yieldSum / stats.morewater.count).toFixed(1):"-";
  // assignment from 3rd IF-block
  document.getElementById('similarwaterCount').textContent = stats.similarwater.count;
  document.getElementById('similarwaterGrowthAverage').textContent = stats.similarwater.count ? (stats.similarwater.growthSum / stats.similarwater.count).toFixed(1) : "-";
  document.getElementById('similarwaterYieldAverage').textContent = stats.similarwater.count ? (stats.similarwater.yieldSum / stats.similarwater.count).toFixed(1):"-";
  // assignment from 4th IF-block
  document.getElementById('lesswaterCount').textContent = stats.lesswater.count;
  document.getElementById('lesswaterGrowthAverage').textContent = stats.lesswater.count ?(stats.lesswater.growthSum / stats.lesswater.count).toFixed(1): "-";
  document.getElementById('lesswaterYieldAverage').textContent = stats.lesswater.count ? (stats.lesswater.yieldSum / stats.lesswater.count).toFixed(1):"-";
 
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
