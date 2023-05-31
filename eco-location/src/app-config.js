let backendHost;
let backendHost_not_es;

const hostname = window && window.location && window.location.hostname;

console.log("hostname", hostname);
if(hostname === "133.186.241.15"){
    backendHost = "http://133.186.241.15:8080/es";
    backendHost_not_es ="http://133.186.241.15:8080";
}

export const API_BASE_URL = `${backendHost}`;
export const API_BASE_URL_NOT_ES=`${backendHost_not_es}`;
