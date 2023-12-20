const axios = require('axios');

async function predictModel(instances, modelName) {
  let endpointId;

  switch (modelName) {
    case 'bpnt_model':
      endpointId = '826982277668929536';
      break;
    case 'bpum_model':
      endpointId = '8583306735907766272';
      break;
    case 'bst_model':
      endpointId = '1537425118886625280';
      break;
    case 'kur_model':
      endpointId = '2550735035044986880';
      break;
    case 'pkh_model':
      endpointId = '8085658977083326464';
      break;
    case 'prakerja_model':
      endpointId = '2777040916320354304';
      break;
    case 'sembako_model':
      endpointId = '1237935743666487296';
      break;
    default:
      throw new Error('Invalid model name');
  }

  try {
    const response = await axios.post(
      `https://asia-southeast2-aiplatform.googleapis.com/v1/projects/sejahtera-capstone-project/locations/asia-southeast2/endpoints/${endpointId}:predict`,
      { instances }
    );

    return response.data.predictions;
  } catch (error) {
    console.error(error);
    throw new Error('Error making prediction');
  }
}

module.exports = { predictModel };
