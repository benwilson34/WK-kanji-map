module.exports.getUserKanji = async (token) => {
	//get list of inds from API
	const endpoint = 'http://localhost:8081/api/ids';
	return await wkApiCall(endpoint, token);
}

module.exports.getAllWkKanji = async (token) => {
	//get list of inds from API
	const endpoint = 'http://localhost:8081/api/all-ids';
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