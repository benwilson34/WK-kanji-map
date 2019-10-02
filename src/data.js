const API_URL_BASE = process.env.API_URL_BASE;

module.exports.getUserKanji = async (token) => {
	//get list of inds from API
	// const endpoint = API_URL_BASE + '/ids';
	const endpoint = 'api/ids';
	return await wkApiCall(endpoint, token);
}

module.exports.getAllWkKanji = async (token) => {
	//get list of inds from API
	const endpoint = 'api/all-ids';
	console.log(endpoint);
	return await wkApiCall(endpoint, token);
}

async function wkApiCall(endpoint, token) {
  const response = await fetch(endpoint, {
  	headers: {
  		"Authorization": "Bearer " + token
  	}
  });
  return await response.json(); //extract JSON from the http response
}
