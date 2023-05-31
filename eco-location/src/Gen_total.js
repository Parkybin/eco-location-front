import React from 'react';
import './css/mapPage.css';
import Map from './Gen_map';
import {GenYearApi }from './GenApiCall';
import GenApiCall from './GenApiCall';
import sel_year from './sel_year'
import Select from 'react-select';
import { ResponsiveBar } from '@nivo/bar';
import Gen_year from './Gen_year';

class MyResponsiveBar extends React.Component { // 지역의 데이터 막대 그래프
    render() {
        var newData = [];
        this.props.data.forEach((yearData) => {
            newData.push({
                "year": yearData.year,
                "태양에너지": Math.round(yearData.generateSolarAmountAverage*100)/100,
                "풍력에너지": Math.round(yearData.generateWindAmountAverage*100)/100
            });
        });
        newData.sort((a, b) => a.year - b.year);
        console.log(newData);
        
        return(
            <ResponsiveBar
                data={newData}
                keys={[ // 표에 나타낼 값
                    "태양에너지",
                    "풍력에너지"
                ]}
                indexBy="year"  // 가로축
                groupMode="stacked"
                margin={{ top: 20, right: 10, bottom: 60, left: 60 }}
                padding={0.4}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'pastel1' }}
                borderColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            1.6
                        ]
                    ]
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: '발전량(MW)',
                    legendPosition: 'middle',
                    legendOffset: -45
                }}
                tooltip={({ data }) => // 마우스 올리면 뜨는 창
                    <div style={{ padding: 12, background: '#222222' }}>
                        <strong>
                            <div style={{ color:"white" }}>
                                {data.year}년도
                            </div>
                            <div style={{ color:"#fbb4ae" }}>
                                태양에너지: {data.태양에너지?data.태양에너지:"0"}kW
                            </div>
                            <div style={{ color:"#b3cde3" }}>
                                풍력에너지: {data.풍력에너지?data.풍력에너지:"0"}kW
                            </div>
                        </strong>
                    </div>
                }
                labelSkipWidth={10}
                labelSkipHeight={10}
                labelTextColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            3
                        ]
                    ]
                }}
                legends={[  // 범례
                    {
                        dataFrom: 'keys',
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 30,
                        translateY: 60,
                        itemsSpacing: 2,
                        itemWidth: 160,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
                role="application"
                ariaLabel="Nivo bar chart demo"
                barAriaLabel={function(e){return e.id+": "+e.formattedValue+" in country: "+e.indexValue}}
            />
        );
    }
}

class Gen_total extends React.Component { // 지역별 발전량 페이지
    constructor(props) {  
        super(props);
        this.state = {
            by: "",
            bgData: {},
            totalData: [],
            sourceData: [],
            loading: true,
            extractedData: [],
            extractedYearData:[],
            responseJson: null,
            error: null,
            year: "2022",
            arr: [],
            selectedOption:null,
            selected_year:'2022',
            sel_year:'',
            allyeardata:[],
            selectedArea:"",
            MakeBar:null
        };
        this.testData = [];//test 배열 초기화
        this.ttotalData=[];
    }

    draw_bar=()=>{

    }
    
    handleChange = selectedOption => {//select로 연도 선택시 실행
        var checkboxs = document.getElementsByClassName("checkbox");
        checkboxs[0].checked = true;
        checkboxs[1].checked = true;

        const selected_year=selectedOption.label;
        this.setState({selectedOption,selected_year});
        console.log('selOption',selected_year);
        
        GenApiCall(selected_year)
        .then((response) => {
            this.setState({
                responseJson: response,
                error: null
            });
            this.get_GenApi_Data(response);
        })
        .catch((error) => {
            console.log(error);
            this.setState({
                responseJson: null,
                error: error
            });
        });
    };
  
  allyear_array_api = (areaName)=>{//한 지역 모든연도 호출1
    GenYearApi(areaName)
      .then((response) => {
        this.setState({
          responseJson: response,
          error: null
        });
        this.get_array_api(response);
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          responseJson: null,
          error: error
        });
      });
  }

  get_array_api = (jsonData) => {//한 지역 모든연도 호출2
    const extractedYearData = [];
    if (jsonData) {
      try {
        const data = jsonData;

        for (const obj of data) {
          const year = obj.year;
          const generateSolarAmountAverage = obj.generateSolarAmountAverage;
          const generateWindAmountAverage = obj.generateWindAmountAverage;

          extractedYearData.push({ year,generateSolarAmountAverage,generateWindAmountAverage });
        }
        console.log('extractedYearData:',extractedYearData);
        this.allyeardata = extractedYearData.map((obj) => {
          return {
            year: obj.year,
            generateSolarAmountAverage: obj.generateSolarAmountAverage,
            generateWindAmountAverage: obj.generateWindAmountAverage,
          };
        });

      } catch (error) {
        console.log(error);
      }
      console.log('allyeardata:',this.allyeardata);
    }
  };

  handle_GenApi_Search = (e) => {//첫 실행시 데이터 불러오기(디폴트 year=2022). 

    const { year } = this.state;
    console.log('year',year);
    GenApiCall(year)
      .then((response) => {
        this.setState({
          responseJson: response,
          error: null
        });
        this.get_GenApi_Data(response);
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          responseJson: null,
          error: error
        });
      });
      
  };

    get_GenApi_Data = (jsonData) => {//select로 연도 선택시 api 2 
        const extractedData = [];

        if (jsonData) {
            try {
                const data = jsonData;

                for (const obj of data) {
                    const area = obj.area;
                    const solarAmount = obj.solarAmount;
                    const windAmount = obj.windAmount;
                    const totalAmount=obj.totalAmount;

                    extractedData.push({ area, solarAmount, windAmount,totalAmount });
                }
                console.log('extractedData:',extractedData);
                this.testData = extractedData.map((obj) => {
                    return {
                        areaName: obj.area,
                        solarAmount: obj.solarAmount,
                        windAmount: obj.windAmount,
                    };
                });
                this.ttotalData=extractedData.map((obj)=>{
                    return{
                        areaName:obj.area,
                        totalAmount:obj.totalAmount,
                    }
                })
            } catch (error) {
                console.log(error);
            }
            const testData = [
                { "areaName": this.testData[0]?.areaName, "solarAmount": this.testData[0]?.solarAmount, "windAmount": this.testData[0]?.windAmount },
                { "areaName": this.testData[1]?.areaName, "solarAmount": this.testData[1]?.solarAmount, "windAmount": this.testData[1]?.windAmount },
                { "areaName": this.testData[2]?.areaName, "solarAmount": this.testData[2]?.solarAmount, "windAmount": this.testData[2]?.windAmount },
                { "areaName": this.testData[3]?.areaName, "solarAmount": this.testData[3]?.solarAmount, "windAmount": this.testData[3]?.windAmount },
                { "areaName": this.testData[4]?.areaName, "solarAmount": this.testData[4]?.solarAmount, "windAmount": this.testData[4]?.windAmount },
                { "areaName": this.testData[5]?.areaName, "solarAmount": this.testData[5]?.solarAmount, "windAmount": this.testData[5]?.windAmount },
                { "areaName": this.testData[6]?.areaName, "solarAmount": this.testData[6]?.solarAmount, "windAmount": this.testData[6]?.windAmount },
                { "areaName": this.testData[7]?.areaName, "solarAmount": this.testData[7]?.solarAmount, "windAmount": this.testData[7]?.windAmount },
                { "areaName": this.testData[8]?.areaName, "solarAmount": this.testData[8]?.solarAmount, "windAmount": this.testData[8]?.windAmount },
                { "areaName": this.testData[9]?.areaName, "solarAmount": this.testData[9]?.solarAmount, "windAmount": this.testData[9]?.windAmount },
                { "areaName": this.testData[10]?.areaName, "solarAmount": this.testData[10]?.solarAmount, "windAmount": this.testData[10]?.windAmount },
                { "areaName": this.testData[11]?.areaName, "solarAmount": this.testData[11]?.solarAmount, "windAmount": this.testData[11]?.windAmount },
                { "areaName": this.testData[12]?.areaName, "solarAmount": this.testData[12]?.solarAmount, "windAmount": this.testData[12]?.windAmount },
                { "areaName": this.testData[13]?.areaName, "solarAmount": this.testData[13]?.solarAmount, "windAmount": this.testData[13]?.windAmount },
                { "areaName": this.testData[14]?.areaName, "solarAmount": this.testData[14]?.solarAmount, "windAmount": this.testData[14]?.windAmount },
                { "areaName": this.testData[15]?.areaName, "solarAmount": this.testData[15]?.solarAmount, "windAmount": this.testData[15]?.windAmount },
                { "areaName": this.testData[16]?.areaName, "solarAmount": this.testData[16]?.solarAmount, "windAmount": this.testData[16]?.windAmount },
                // 나머지 요소들도 마찬가지로 수정
            ];  
            const ttotalData=[
                { "areaName": this.ttotalData[0]?.areaName, "totalAmount": this.ttotalData[0]?.totalAmount, },
                { "areaName": this.ttotalData[1]?.areaName, "totalAmount": this.ttotalData[1]?.totalAmount, },
                { "areaName": this.ttotalData[2]?.areaName, "totalAmount": this.ttotalData[2]?.totalAmount, },
                { "areaName": this.ttotalData[3]?.areaName, "totalAmount": this.ttotalData[3]?.totalAmount, },
                { "areaName": this.ttotalData[4]?.areaName, "totalAmount": this.ttotalData[4]?.totalAmount, },
                { "areaName": this.ttotalData[5]?.areaName, "totalAmount": this.ttotalData[5]?.totalAmount, },
                { "areaName": this.ttotalData[6]?.areaName, "totalAmount": this.ttotalData[6]?.totalAmount, },
                { "areaName": this.ttotalData[7]?.areaName, "totalAmount": this.ttotalData[7]?.totalAmount, },
                { "areaName": this.ttotalData[8]?.areaName, "totalAmount": this.ttotalData[8]?.totalAmount, },
                { "areaName": this.ttotalData[9]?.areaName, "totalAmount": this.ttotalData[9]?.totalAmount, },
                { "areaName": this.ttotalData[10]?.areaName, "totalAmount": this.ttotalData[10]?.totalAmount, },
                { "areaName": this.ttotalData[11]?.areaName, "totalAmount": this.ttotalData[11]?.totalAmount, },
                { "areaName": this.ttotalData[12]?.areaName, "totalAmount": this.ttotalData[12]?.totalAmount, },
                { "areaName": this.ttotalData[13]?.areaName, "totalAmount": this.ttotalData[13]?.totalAmount, },
                { "areaName": this.ttotalData[14]?.areaName, "totalAmount": this.ttotalData[14]?.totalAmount, },
                { "areaName": this.ttotalData[15]?.areaName, "totalAmount": this.ttotalData[15]?.totalAmount, },
                { "areaName": this.ttotalData[16]?.areaName, "totalAmount": this.ttotalData[16]?.totalAmount, },
    
            ]
            this.setState({by:"total", totalData:ttotalData, loading:false}, this.calcBackgroundColor(ttotalData))
            this.setState({sourceData:testData})
        }
    };

    calcBackgroundColor = (items) => {//색깔 설정
      console.log("calc", items);
        var maxValue, minValue, d, bg0, bg1;
        if(this.state.by=="total") {
            maxValue = items.reduce((max, p) => p.totalAmount > max ? p.totalAmount : max, items[0].totalAmount); 
            minValue = items.reduce((min, p) => p.totalAmount < min ? p.totalAmount : min, items[0].totalAmount); 
            d = (maxValue-minValue+1)/10;
            bg0 = "#22";
            bg1 = "F22";
        } else if(this.state.by=="source1") {
            maxValue = items.reduce((max, p) => p.solarAmount > max ? p.solarAmount : max, items[0].solarAmount); 
            minValue = items.reduce((min, p) => p.solarAmount < min ? p.solarAmount : min, items[0].solarAmount); 
            d = (maxValue-minValue+1)/10;
            bg0 = "#";
            bg1 = "F2222";
        } else if(this.state.by=="source2") {
            maxValue = items.reduce((max, p) => p.windAmount > max ? p.windAmount : max, items[0].windAmount); 
            minValue = items.reduce((min, p) => p.windAmount < min ? p.windAmount : min, items[0].windAmount); 
            d = (maxValue-minValue+1)/10;
            bg0 = "#2222";
            bg1 = "F";
        } else {
            maxValue = 0; 
            minValue = 0; 
            d = 0;
            bg0 = "";
            bg1 = "";
        }

        var newbgData = {"min": minValue, "d": d, "bg0": bg0, "bg1": bg1};
        // console.log(newbgData);
        if(JSON.stringify(this.state.bgData)!=JSON.stringify(newbgData)) {
            this.setState({bgData: newbgData}, () => {this.drawLegend(); this.sideInfo();});
        } 
    }

    drawLegend = () => {//그리기
        var legendContainer = document.querySelector(".legendContainer");
        legendContainer.innerHTML = "";
        if(this.state.by==="null") return;
        for(var i=0; i<10; i++) {
            var backgroundColor = this.state.bgData.bg0+(15-i).toString(16)+this.state.bgData.bg1;
            var range = document.createElement("div");
            range.className = "range";
            range.innerHTML = "<div class='color' style='background-color:"+backgroundColor+"'></div>"+
                                "<div class='lbl'>"+ 
                                    Math.round((this.state.bgData.min+i*this.state.bgData.d)*100)/100+" - "+ 
                                    Math.round((this.state.bgData.min+(i+1)*this.state.bgData.d-1)*100)/100 +
                                "</div>";
            legendContainer.appendChild(range);
        }
        
        var unit = document.createElement("div");
        unit.className = "small";
        unit.innerHTML = "단위: MW"
        legendContainer.appendChild(unit);
    };
    
    sideInfo = (areaName) => {// 클릭당한 지역의 정보를 사이드 영역에 띄움
        this.allyear_array_api(areaName);
        console.log('클릭실행', areaName);
        this.setState({selectedArea:areaName});
        // 다만 문제가 있습니다 state에 selectedArea를 넣어서 사용하는데 
        // 체크박스나 셀렉트에 변화가 생기면 값이 없어져서 사이드가 날아감 주의
        const title = document.querySelector('.sideArea .title');
        const info = document.querySelector('.sideArea .info');
        title.innerHTML = "";
        info.innerHTML = "";
        if(!areaName) {
            return;
        }
        title.innerHTML = areaName+" 연평균 발전량 변화<hr/>";
        info.innerHTML = "<div class='small'>* 단위: MW</div>";

        const { selected_year,allyeardata } = this.state;
        
        console.log('side_allyeardata:',this.allyeardata);
        var data=this.allyeardata;
        console.log('data',data[0]);
        
        console.log(areaName);
      }
    
    checkHandler = (e) => {//체크박스 핸들러
        var checkboxs = document.getElementsByClassName("checkbox");
        if(checkboxs[0].checked && checkboxs[1].checked) {  // 둘다 체크
            this.setState({by:"total"}, () => {this.calcBackgroundColor(this.state.totalData)});
        } else if(checkboxs[0].checked && !checkboxs[1].checked) {
            this.setState({by:"source1"}, () => {this.calcBackgroundColor(this.state.sourceData)});
        } else if(!checkboxs[0].checked && checkboxs[1].checked) {
            this.setState({by:"source2"}, () => {this.calcBackgroundColor(this.state.sourceData)});
        } else if(!checkboxs[0].checked && !checkboxs[1].checked) { // 둘다 미체크
            this.setState({by:"null"}, () => {this.calcBackgroundColor(this.state.sourceData);});
        }
    }

    
    componentDidMount() {
        this.handle_GenApi_Search();
        this.allyear_array_api('강원');
        const testData=this.testData;
        const ttotalData=this.ttotalData;
        console.log("comp_testData:",testData);
        console.log("comp_ttotalData:",ttotalData);
        
        this.setState({by:"total", totalData:ttotalData, loading:false}, this.calcBackgroundColor(ttotalData))
        this.setState({sourceData:testData});

        // 네비게이션바 현재위치 색넣기 (단순무식하게 구현)
        const nav = document.getElementsByClassName("item");
        for(var i=0; i<nav.length; i++) {
            nav[i].addEventListener("mouseenter", function () {
                this.style.background = "linear-gradient(to bottom, lightgray, white)";
            });

            if(i===1) {
                nav[i].style.backgroundColor = "#DDD";
                nav[i].addEventListener("mouseleave", function () {
                    this.style.background = "#DDD";
                });
            } else {
                nav[i].style.backgroundColor = "#FFF";
                nav[i].addEventListener("mouseleave", function () {
                    this.style.background = "#FFF";
                });
            }
        }
    }
    
    
    
    render() {
        const { year, error, responseJson, extractedData, arr,value,allyeardata,MakeBar } = this.state;
        const {selectedOption}= this.state;

        var map;
        if(this.state.totalData&&this.state.by=="total") {
            map = this.state.totalData.length>0&&(<Map by={this.state.by} items={this.state.totalData} bgData={this.state.bgData} sideInfo={this.sideInfo} />);
        } else if (this.state.sourceData) {
            map = this.state.sourceData.length>0&&(<Map by={this.state.by} items={this.state.sourceData} bgData={this.state.bgData} sideInfo={this.sideInfo} />);
        } else {
            map = <div className='mapContainer'></div>
        }

        var bar;
        if(this.allyeardata&&this.state.selectedArea) {
            console.log("bar create");
            bar = this.allyeardata.length>0&&(<MyResponsiveBar data={this.allyeardata} />);
        } else {
            bar = <div className='bar'></div>;
        }

        var totalGeneratePage = (
            <div className='pageContainer'>
                {map}
                <div className='sideController'>
                    {/* <p style={{ border: "2px solid orange", backgroundColor: 'wheat' }}>연간 과거 발전량 데이터</p> */}
                    <div className='legendContainer'></div>
                    <div style={{ border: "2px solid orange", backgroundColor: 'wheat' }}>
                        <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px", backgroundColor:"white" }}>
                            <div>연도 선택</div>
                            <Select
                            className='Select'
                            value={selectedOption}
                            onChange={this.handleChange}
                            options={sel_year}
                            placeholder='2022'
                            />        
                        </div>
                    </div>
                    <div className='checkboxContainer'>
                        <label style={{color:"red"}}>
                            <input className='checkbox' type="checkbox" onChange={this.checkHandler} defaultChecked="true" />태양에너지
                        </label>
                        <label style={{color:"blue"}}>
                            <input className='checkbox' type="checkbox" onChange={this.checkHandler} defaultChecked="true" />풍력에너지
                        </label>
                        {this.MakeBar}
                    </div>
                </div>
                <div className='sideArea'>
                    <div className='title'></div>
                    <div className='barContainer'>
                        {bar}
                    </div>
                    <div className='info'></div>
                </div>
            </div>
        );

        var loadingPage = <h1>...</h1>
        var content = loadingPage;

        if(!this.state.loading) {
            console.log("loading end");
            content = totalGeneratePage;
        }

        return(
            <div className='container'>
                {content}
            </div>
        );
    }
}

export default Gen_total;
