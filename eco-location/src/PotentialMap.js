import React from "react";
import './css/mapPage.css';
import boundaryData from "./boundary_potential.json";

function polygon(map, boundary, bgData, data) { // 1회당 도/광역시 하나
    if(!bgData||!boundary) return;

    // 배경색 변경
    var backgroundColor = bgData.bg0+ Math.floor(15-(data-bgData.min)/bgData.d).toString(16) +bgData.bg1;

    // 이벤트
    var customOverlay = new window.kakao.maps.CustomOverlay({});
    var innerContent;
    if(bgData.bg0.length===3) {
        innerContent = "<div class='title'>"+boundary.properties.CTP_KOR_NM+" 잠재량 총합</div>"+
                    "<div class='info'>"+Math.round(data/10)/100+"kW</div>";
    } else if(bgData.bg0.length===1) {
        innerContent = "<div class='title'>"+boundary.properties.CTP_KOR_NM+" 태양에너지 잠재량 총합</div>"+
                    "<div class='info'>"+Math.round(data/10)/100+"kW</div>";
    } else { 
        innerContent = "<div class='title'>"+boundary.properties.CTP_KOR_NM+" 풍력에너지 잠재량 총합</div>"+
                    "<div class='info'>"+Math.round(data/10)/100+"kW</div>";
    }

    // 마우스오버 - 배경색 변경 + 커스텀오버레이 표시
    var mouseOverHandler = function(mouseEvent) {
        polygons.forEach((polygon) => { polygon.setOptions({fillColor: '#FF0'}) });

        customOverlay.setContent("<div class='customInfo'>"+innerContent+"</div>");
        var point = new window.kakao.maps.LatLng(mouseEvent.latLng.getLat()+1,mouseEvent.latLng.getLng()-1.4);
        customOverlay.setPosition(point);
        customOverlay.setZIndex(20);
        customOverlay.setMap(map);
    };

    // 마우스이동 - 커스텀오버레이 위치 변경
    var mouseMoveHandler = function(mouseEvent) {
        var point = new window.kakao.maps.LatLng(mouseEvent.latLng.getLat()+1,mouseEvent.latLng.getLng()-1.4);
        customOverlay.setPosition(point);
    };

    // 마우스아웃 - 배경색 원래대로 + 커스텀오버레이 제거 
    var mouseOutHandler = function() {
        polygons.forEach((polygon) => { polygon.setOptions({fillColor: backgroundColor}) });
        
        customOverlay.setMap(null);
    };
        
    // 구역 이름 라벨 생성
    var content = document.createElement('div');
    content.className = 'label';
    if(boundary.properties.CTP_KOR_NM.length>4) {
        content.innerHTML = boundary.properties.CTP_KOR_NM.substr(0,2);
    } else {
        content.innerHTML = boundary.properties.CTP_KOR_NM.substr(0,1) + boundary.properties.CTP_KOR_NM.substr(boundary.properties.CTP_KOR_NM.length-2,1);
    }
    var label = new window.kakao.maps.CustomOverlay({ // 찍기좋게 boundary파일에 수동으로 center값을 넣었습니다
        position: new window.kakao.maps.LatLng(boundary.geometry.center[1], boundary.geometry.center[0]),  
        content: content
    });
    label.setMap(map);

    // 라벨 위에선 지도 위의 이벤트와 다른 이벤트가 발생해서 방식을 우회함
    var customInfo = document.querySelector(".customInfo");
    customInfo.style.display="none";
    content.addEventListener('mouseover', () => {
        polygons.forEach((polygon) => { polygon.setOptions({fillColor: '#FF0'}) });
        
        customInfo.innerHTML = innerContent;
        customInfo.style.display = 'block';
    });
    content.addEventListener('mouseleave', () => {
        polygons.forEach((polygon) => { polygon.setOptions({fillColor: backgroundColor}) });
        customInfo.style.display = 'none';
    });
      
    content.addEventListener('mousemove', (event) => {
        customInfo.style.left = event.clientX - 125 + 'px';
        customInfo.style.top = event.clientY - 157 + 'px';
    });
    
    // 폴리곤 생성 (구역당 여러개일 수 있음)
    var polygons = [];
    boundary.geometry.coordinates.forEach((coors) => {
        // 카카오 위도경도로 타입변환 (파일이랑 위도경도가 반대임)
        var path = [];
        coors.forEach((coor) => { 
            path.push(new window.kakao.maps.LatLng(coor[1], coor[0]));
        })

        // 폴리곤 그리기
        var polygon = new window.kakao.maps.Polygon({
            path:path, // 좌표 배열
            strokeWeight: 2,  // 선 두께
            strokeColor: "#000000", // 선 색깔
            strokeOpacity: 0.3,
            fillColor: backgroundColor, 
            fillOpacity: 1, // 채우기 투명도
            zIndex: 1
        });
        polygon.setMap(map);
        polygons.push(polygon);

        // 이벤트 넣기
        window.kakao.maps.event.addListener(polygon, 'mouseover', mouseOverHandler);
        window.kakao.maps.event.addListener(polygon, 'mousemove', mouseMoveHandler);
        window.kakao.maps.event.addListener(polygon, 'mouseout', mouseOutHandler);
    });
}


class KakaoMap extends React.Component {
    // 맵 그리는 함수
    map = () => {  
        const container = document.getElementById('map');
        const options = {
            center: new window.kakao.maps.LatLng(35.8, 128),  // lat은 세로 lng은 가로 
            level: 13,
            disableDoubleClickZoom: true,
        };
        const map = new window.kakao.maps.Map(container, options);
        // 확대 막기
        map.setZoomable(false);
    
        // 배경에 흰색 덮기
        var path = [];
        path.push(new window.kakao.maps.LatLng(44.13, 115.1));
        path.push(new window.kakao.maps.LatLng(44.02, 139.9));
        path.push(new window.kakao.maps.LatLng(31.05, 137.8));
        path.push(new window.kakao.maps.LatLng(31.08, 117.04));
        var back = new window.kakao.maps.Polygon({
            path:path,
            strokeWeight: 2,  // 선 두께
            strokeColor: "#666666", // 선 색깔
            strokeOpacity: 0.6,
            fillColor: "#FFFFFF", 
            fillOpacity: 0.6 // 채우기 투명도
        });
        back.setMap(map);

        if(this.props.by==="null"||!this.props.items) return;
    
        // 다각형 그리기
        this.props.items.forEach((item) => {
            if(this.props.by==="total") {
                polygon(map, boundaryData.features.find((b) => b.properties.CTP_KOR_NM===item.areaName), this.props.bgData, item.potentialAmount);
            } else if(this.props.by==="source1") {
                polygon(map, boundaryData.features.find((b) => b.properties.CTP_KOR_NM===item.areaName), this.props.bgData, item.solarEnergyPotential);
            } else if(this.props.by==="source2") {
                polygon(map, boundaryData.features.find((b) => b.properties.CTP_KOR_NM===item.areaName), this.props.bgData, item.windEnergyPotential);
            }
        });
    }

    componentDidUpdate() {
        // 스크립트 로드 완료 여부 확인
        if (typeof window.kakao !== "undefined" && typeof window.kakao.maps !== "undefined" && typeof window.kakao.maps.LatLng !== "undefined") {
            // 지도 그리기
            this.map();
        }
    }

    componentDidMount() {
        // kakao map api 스크립트
        const script = document.createElement("script");
        script.type="text/javascript";
        script.src=`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false&libraries=services,clusterer&`;
        script.async = true;
        document.head.appendChild(script);

        // 지도 그리기
        script.onload = () => { 
            window.kakao.maps.load(() => {
                if (typeof window.kakao !== "undefined" && typeof window.kakao.maps !== "undefined" && typeof window.kakao.maps.LatLng !== "undefined") {
                    this.map();
                }
            })
        };
    }

    render() {
        return(
        <div className="mapContainer">
            <div id="map"></div>
            <div className="customInfo"></div>
        </div>
        );
    }
}
export default KakaoMap;