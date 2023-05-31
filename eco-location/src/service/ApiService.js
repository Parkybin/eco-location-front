import {API_BASE_URL, API_BASE_URL_NOT_ES} from "../app-config";

export function call(api, method, request){
    let headers = new Headers({
        "Content-Type": "application/json",
    });

    let options = {
        headers: headers,
        url:API_BASE_URL + api,
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


export function call_for_not_es(api, method, request){
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

// 해당 지역의 발전소 리스트 가져오기
// 광역지자체 + 시군구 단위로 검색 (ex : 경상북도 경산시)
export function Generator_DetailArea(Area){
    return call("/generators?detailArea=" + Area, "GET", null)
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

// 해당 발전원의 발전소 리스트 가져오기
// 발전원 이름으로 검색 (ex : 태양에너지(많아서 오래걸림), 수력에너지)
export function Generator_powerSource(powerSource){
    return call("/generators?powerSource=" + powerSource, "GET", null)
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

// 해당 지역의 발전소 종류(갯수만) 리스트 가져오기
// 광역지자체 + 시군구 단위로 검색 (ex : 경상북도 경산시)
export function Generator_DetailArea_Count(Area){
    return call("/generators/count?detailArea=" + Area, "GET", null)
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

// 잠재 발전량 데이터를 전부 전송한다.
// 주의 : 너무 커서 가능하면 사용 x
export function Potential_All(){
    return call("/energy-potential/allEP", "GET", null) 
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

// 해당 연도의 지역별 잠재량 총합(태양 + 풍력) 리스트 가져오기
// 연도만 사용하여 검색(ex: 2022)
export function Potential_Year_Sum(Year){
    return call_for_not_es("/energy-potential/source?year=" + Year, "GET", null)
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

// 해당 연도의 지역별 잠재량을 나눠서(태양, 풍력) 리스트 가져오기
// 연도만 사용하여 검색
export function Potential_Year(Year){
    return call("/energy-potential/source-type?year=" + Year, "GET", null)
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

// 지정된 기간의 모든 잠재량 데이터 가져오기
// 1시간 단위로 나눠져 있기 때문에, 파라미터는 다음과 같이 사용하여 검색
// ex : 2020-10-01 12:00:00, 2020-10-05 12:00:00
export function Potential_Period(Start, End){
    return call("/energy-potential?from=" + Start + "&to=" + End, "GET", null)
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

// 지역을 파라미터로 모든 지역별 비율 정보 가져오기
// 지역만 사용해서 검색(ex : 서울, 경북)
export function AreaGeneratorSource_Area(Area){
    return call("/areageneratorsource?Area=" + Area, "GET", null)
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

// 시간을 파라미터로 모든 지역별 비율 정보 가져오기
// 연-월만 사용해서 검색(ex : 22-10 (22년 10월))
export function AreaGeneratorSource_Date(Date){
    return call("/areageneratorsource?Date=" + Date, "GET", null)
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

// 기간을 파라미터로 모든 지역별 비율 정보 가져오기
// 시작연-월, 끝연-월만 사용해서 검색(ex : 22-10, 22-12 (22년 10월, 22년 12월))
export function AreaGeneratorSource_Period(Start, End){
    return call("/areageneratorsource/?StartDate=" + Start +"&EndDate=" + End , "GET", null)
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

// 지역과 기간을 파라미터로 해당하는 지역별 비율 정보 가져오기
// 지역, 시작연-월, 끝연-월을 사용해서 검색(ex : 경북, 22-10, 22-12 (22년 10월, 22년 12월))
export function AreaGeneratorSource_Area_Period(Area, Start, End){
    return call("/areageneratorsource/?Area="+ Area + "&StartDate=" + Start +"&EndDate=" + End , "GET", null)
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

export function tomain(){
    window.location.href="/";
}

