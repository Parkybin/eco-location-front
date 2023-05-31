import {API_BASE_URL_NOT_ES} from "./app-config.js";


export function call(api, method, request){
    let headers = new Headers({
        "Content-Type": "application/json",
    });

    let options = {
        headers: headers,
        url:API_BASE_URL_NOT_ES + api,
        method: method,
    };
    if(request){
        options.body = JSON.stringify(request);
    }
    return fetch(options.url, options)
        .then((response) => 
            response.json().then((json) => {
                if(!response.ok){
                    return Promise.reject(json);
                }
                return json;
            })
    )
    .catch((error) => {
        console.log("loginerror");
        console.log(error.status);
        console.log("Oops!");
        if(error.status == 403){
            window.location.href = "/login";
        }
        return Promise.reject(error);
    });
}


export default function GenApiCall(year){//date라고 되어있지만 연도를 넣어야 함. 단위 메가와트
    return call("/generate-amount?date=" + year , "GET", null)
        .then((response) => {
            if(response) {
                return response;
            } else {
                return Promise.reject(new Error("Invalid response"));
            }
        })
        .catch((error) => {
            console.log("infoerror");
            console.log(error);
            console.log("Oops!");
            return Promise.reject(error);
        });
    }

export function GenYearApi(area){//date라고 되어있지만 연도를 넣어야 함. 단위 메가와트
    return call('/generate-amount/average?area='+area, "GET", null)
        .then((response) => {
            if(response) {
                return response;
            } else {
                return Promise.reject(new Error("Invalid response"));
            }
        })
        .catch((error) => {
            console.log("infoerror");
            console.log(error);
            console.log("Oops!");
            return Promise.reject(error);
        });
    }
    


