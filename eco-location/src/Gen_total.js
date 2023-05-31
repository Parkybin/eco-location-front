import React from 'react';
import './css/TotalPotential.css';
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
                "생산 비율": Math.round(yearData.data.find((i) => i.areaName==this.props.selectedArea).renewableEnergyPercent*10000)/100
            });
        });
        newData.sort((a, b) => a.year - b.year);
        
        return(
            <ResponsiveBar
                data={newData}
                keys={[ // 표에 나타낼 값
                    "생산 비율"
                ]}
                indexBy="year"  // 가로축
                groupMode="stacked"
                margin={{ top: 30, right: 20, bottom: 60, left: 50 }}
                padding={0.3}
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
                    legend: '생산 비율(%)',
                    legendPosition: 'middle',
                    legendOffset: -40
                }}
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
            bg0 = "#00";
            bg1 = "F00";
        } else if(this.state.by=="source1") {
            maxValue = items.reduce((max, p) => p.solarAmount > max ? p.solarAmount : max, items[0].solarAmount); 
            minValue = items.reduce((min, p) => p.solarAmount < min ? p.solarAmount : min, items[0].solarAmount); 
            d = (maxValue-minValue+1)/10;
            bg0 = "#";
            bg1 = "F0000";
        } else if(this.state.by=="source2") {
            maxValue = items.reduce((max, p) => p.windAmount > max ? p.windAmount : max, items[0].windAmount); 
            minValue = items.reduce((min, p) => p.windAmount < min ? p.windAmount : min, items[0].windAmount); 
            d = (maxValue-minValue+1)/10;
            bg0 = "#0000";
            bg1 = "F";
        }

        var newbgData = {"min": minValue, "d": d, "bg0": bg0, "bg1": bg1};
        // console.log(newbgData);
        if(JSON.stringify(this.state.bgData)!=JSON.stringify(newbgData)) {
            this.setState({bgData: newbgData}, () => {this.drawLegend()});
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

    sideInfo = (areaName) => {// 클릭당한 지역의 정보를 사이드 영역에 띄움
        this.allyear_array_api(areaName);
        console.log('클릭실행');
        var side = document.querySelector(".side");
        if(!areaName) {
            side.innerHTML = "";
            return;
        }
        
        const { selected_year,allyeardata } = this.state;
        
        console.log('side_allyeardata:',this.allyeardata);
        var data=this.allyeardata;
        console.log('data',data[0]);
        
        // side.innerHTML = 
        // "<div class='title'>"+this.allyeardata+" 발전량 총합</div>"+
        // "<div class='info'>"+areaName+"  "+data[8].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[8].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[8].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[9].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[9].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[9].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[10].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[10].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[10].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[11].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[11].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[11].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[0].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[0].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[0].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[1].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[1].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[1].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[2].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[2].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[2].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[3].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[3].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[3].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[4].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[4].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[4].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[5].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[5].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[5].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[6].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[6].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[6].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        // "<div class='info'>"+data[7].year+'년'+"</div>"+
        // "<div class='info'>"+'태양에너지:'+data[7].generateSolarAmountAverage+"</div>"+
        // "<div class='info'>"+'풍력에너지:'+data[7].generateWindAmountAverage+"</div>"+
        // "<div class='info'>"+" "+"</div>"+
        
        console.log(areaName);

      }
    
    componentDidMount() {
      
      this.handle_GenApi_Search()
      this.allyear_array_api('강원')
        const testData=this.testData;
        const ttotalData=this.ttotalData;
        console.log("comp_testData:",testData);
        console.log("comp_ttotalData:",ttotalData);
        
        this.setState({by:"total", totalData:ttotalData, loading:false}, this.calcBackgroundColor(ttotalData))
        this.setState({sourceData:testData})
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

        // var bar;
        // if(this.state.selectedArea) {
        //     bar = this.state.items.length>0&&(<MyResponsiveBar selectedArea={this.state.selectedArea} data={this.state.items} />);
        // } else {
        //     bar = <div className='bar'></div>;
        // }

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
                <div className='side'>
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
