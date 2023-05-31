import React from 'react';
import './css/Exist_Gen_Map.css'
import locationData from "./location_coor.json";
import { Generator_DetailArea } from './service/ApiService';
import ReactPaginate from 'react-paginate';

class Exist_Gen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      area:'',
      markers: [],
      items: locationData,
      areaData:[],
      selectedMarker:null,
      selectedMarkerData:null,
      responseJson:null,
      error:null,
      sortOrder: 'asc', // 추가: 정렬 순서를 저장하는 상태 변수
      currentPage: 0, // 추가: 현재 페이지 번호를 저장하는 상태 변수
      itemsPerPage: 8 // 추가: 페이지 당 표시할 항목 수
    };
  }

  handle_GenArea_Search(location) {
    var area = location;
    Generator_DetailArea(area)
      .then((response) => {
        this.setState({
          responseJson: response,
          error: null
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          responseJson: null,
          error: error
        });
      });
  };

  drawMap() {
    console.log("drawMap");
    const container = document.getElementById('map');
    const options = {
      center: new window.kakao.maps.LatLng(35.8, 127.5),
      level: 13,
    };
    const map = new window.kakao.maps.Map(container, options);
    // map.setMapTypeId(window.kakao.maps.MapTypeId.SKYVIEW);

    console.log(this.state.items);
    const markerGroups = {
      서울특별시: [],
      경기도: [],
      강원도: [],
      인천광역시: [],
      충청북도: [],
      충청남도: [],
      제주특별자치도: [],
      전라북도: [],
      전라남도: [],
      울산광역시: [],
      세종특별자치시: [],
      대전광역시: [],
      광주광역시: [],
      대구광역시: [],
      경상북도: [],
      경상남도: [],
      부산광역시: []
    };
    
    this.state.items.forEach((item) => {
      var position = new window.kakao.maps.LatLng(item.COOR_X, item.COOR_Y);
    
      // location에 따른 마커 그룹을 찾아서 해당 그룹에 마커 추가
      Object.keys(markerGroups).forEach((location) => {
        if (item.location.includes(location)) {
          var marker = this.drawMarker(map, position, item.location);
          markerGroups[location].push(marker);
        }
      });
    });
    
    // 마커 클러스터링 처리
    Object.keys(markerGroups).forEach((location) => {
      var clusterer = new window.kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 9,
        disableClickZoom: false,
        markers: markerGroups[location], // 해당 그룹의 마커들을 클러스터에 추가
        texts:[location]
      });
    });
  }

  drawMarker(map, position, location){
    var marker = new window.kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: position,  // 마커를 표시할 위치
      title : location // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
    });

    var self = this;

    window.kakao.maps.event.addListener(marker, 'click', function() {
      // 마커의 클릭이벤트를 선언합니다.
      self.setState({ selectedMarker: marker });
      self.handle_GenArea_Search(location);
    });

    return marker;
  }

  componentDidMount() {
    // kakao map api 스크립트
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false&libraries=services,clusterer&`;
    script.async = true;
    document.head.appendChild(script);

    // 스크립트 로드 완료 시에 지도 그리기
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log("onload");
        this.drawMap();
      });
    };
  }

  
  handleSort = (column) => {
    const { sortBy, sortOrder } = this.state;
    if (column === sortBy) {
      // 같은 열을 클릭한 경우 정렬 순서를 변경합니다.
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      this.setState({
        sortOrder: newSortOrder
      });
    } else {
      // 다른 열을 클릭한 경우 정렬 기준을 변경합니다.
      this.setState({
        sortBy: column,
        sortOrder: 'asc'
      });
    }
  };

  handlePageClick = (data) => {
    const selectedPage = data.selected;
    this.setState({
      currentPage: selectedPage
    });
  };

  render() {
    const { selectedMarker, responseJson, sortBy, sortOrder, currentPage, itemsPerPage } = this.state;

    let sortedData = [];
    let tableContent = null;
    if (responseJson) {



      sortedData = [...responseJson].sort((a, b) => {
        if (sortBy === 'generatorName') {
          return sortOrder === 'asc' ? a.generatorName.localeCompare(b.generatorName) : b.generatorName.localeCompare(a.generatorName);
        } else if (sortBy === 'generateAmount') {
          return sortOrder === 'asc' ? a.generateAmount - b.generateAmount : b.generateAmount - a.generateAmount;
        } else if (sortBy === 'powerSource') {
          return sortOrder === 'asc' ? a.powerSource.localeCompare(b.powerSource) : b.powerSource.localeCompare(a.powerSource);
        }
        return 0;
      });

      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pagedData = sortedData.slice(startIndex, endIndex);

      tableContent = (
        <table>
          <thead>
            <tr>
              <th onClick={() => this.handleSort('generatorName')}>
                발전기명
                {sortBy === 'generatorName' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
              </th>
              <th onClick={() => this.handleSort('generateAmount')}>
                발전설비량
                {sortBy === 'generateAmount' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
              </th>
              <th onClick={() => this.handleSort('powerSource')}>
                발전원
                {sortBy === 'powerSource' && <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((item, index) => (
              <tr key={index}>
                <td>{item.generatorName}</td>
                <td>{item.generateAmount} MW</td>
                <td>{item.powerSource}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <div className="container">
        <div className="pageContainer">
          <div className="mapContainer">
            <div id="map"></div>
          </div>
          <div className="side">
            {selectedMarker && (
              <div id="infocontainer">
                <h2>{selectedMarker.getTitle()}</h2>
                <div className="tableContainer">
                  {tableContent}
                </div>
                {/* 페이징 컴포넌트 추가 */}
                {responseJson && (
                  <div className="paginationContainer"> {/* 페이징 컨테이너로 감싸줍니다. */}
                    <ReactPaginate
                      previousLabel={'이전'}
                      nextLabel={'다음'}
                      breakLabel={'...'}
                      breakClassName={'break-me'}
                      pageCount={Math.ceil(responseJson.length / itemsPerPage)}
                      marginPagesDisplayed={1}
                      pageRangeDisplayed={1}
                      onPageChange={this.handlePageClick}
                      containerClassName={'pagination'}
                      activeClassName={'active'}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Exist_Gen;
