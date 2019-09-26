// const API_BASE = 'http://localhost:8081/api';
const API_BASE = 'http://192.168.1.207:8081/api';

module.exports.getUserKanji = async (token) => {
	//get list of inds from API
	const endpoint = API_BASE + '/ids';
	return await wkApiCall(endpoint, token);
}

module.exports.getAllWkKanji = async (token) => {
	//get list of inds from API
	const endpoint = API_BASE + '/all-ids';
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