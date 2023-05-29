import React from 'react';
import './css/RenewablePercent.css';
import Map from './PercentMap';
import {call} from './service/ApiService';
import { ResponsiveBar } from '@nivo/bar';

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
                margin={{ top: 30, right: 50, bottom: 80, left: 100 }}
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
                    legendOffset: -70
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

class RenewablePercent extends React.Component { // 지역별 생산비율 페이지
    constructor(props) {  
        super(props);
        this.state = {
            year: -1,
            selectedArea: "",
            bgData: {},
            items: [],
            loading: true,
        };
    }

    calcBackgroundColor = (items) => {
        if(!items) return;

        var maxValue, minValue, d;
        maxValue = items.reduce((max, p) => p.renewableEnergyPercent > max ? p.renewableEnergyPercent : max, items[0].renewableEnergyPercent); 
        minValue = items.reduce((min, p) => p.renewableEnergyPercent < min ? p.renewableEnergyPercent : min, items[0].renewableEnergyPercent); 
        d = (maxValue-minValue)/10;
        console.log(maxValue, minValue, d);
        var newbgData = {"min": minValue, "d": d};
        if(JSON.stringify(this.state.bgData)!=JSON.stringify(newbgData)) {
            this.setState({bgData: newbgData}, () => {this.drawLegend();});
        }
    }

    drawLegend = () => {
        var legendContainer = document.querySelector(".legendContainer");
        legendContainer.innerHTML = "";
        for(var i=0; i<10; i++) {
            var tmp = (15-i).toString(16);
            var backgroundColor = "#22"+tmp+"F"+tmp+"F";
            var range = document.createElement("div");
            range.className = "range";
            range.innerHTML = "<div class='color' style='background-color:"+backgroundColor+"'></div>"+
                                "<div class='lbl'>"+ 
                                Math.floor((this.state.bgData.min+i*this.state.bgData.d)*1000)/1000+" ~ "+ 
                                Math.ceil((this.state.bgData.min+(i+1)*this.state.bgData.d)*1000)/1000 +
                                "</div>";
            legendContainer.appendChild(range);
        }
        
        var unit = document.createElement("div");
        unit.className = "small";
        unit.innerHTML = "* 단위: %"
        legendContainer.appendChild(unit);

        // 소계 하단에 띄우기
        const select = document.querySelector(".totalInfo");
        this.state.items.find((i) => i.year==this.state.year).data.forEach((item) => {
            if(item.areaName==="소계") {
                select.innerHTML = "<div class='title'>"+this.state.year+"년 생산 비율 평균</div>"+
                                "<div class='info'>"+Math.round(item.renewableEnergyPercent*10000)/100+"%</div>";
                return;
            }
        });
    };

    sideInfo = (areaName) => {
        // 지도 클릭시 우측에 그 지역 데이터 그래프 그리기
        const title = document.querySelector('.side .title');
        const info = document.querySelector('.side .info');

        if(areaName) {
            title.innerHTML = areaName+" 재생에너지 생산 비율 변화";
            info.innerHTML = "<div class='small'>* 단위: %</div>";
            if(areaName!=this.state.selectedArea) {
                this.setState({selectedArea:areaName});
            }
        } else {
            title.innerHTML = "원하시는 지역을 선택하주세요.";
            info.innerHTML = "";
        }
    }
    
    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value }, () => {this.calcBackgroundColor(this.state.items.find((i) => i.year==this.state.year).data);});
    }

    componentDidMount() {
        // 기본 현재 년도를 찍음
        const year = new Date().getFullYear();

        var newItems = [];
        for(let i=year; i>=2018; i--) {
            call("/areageneratorsource?start="+i+"-01-01&end="+i+"-12-31", "GET", null).then((response) => {
                newItems.push({year:i, data:response});
                if(newItems.length===(year-2017)) {
                    this.setState({year:year, items:newItems, loading:false}, () => {
                        this.calcBackgroundColor(this.state.items.find((i) => i.year==year).data); 
                        this.sideInfo();

                        const select = document.getElementById("yearSelect");
                        select.innerHTML = "";
                        for (let y = year; y >= 2018; y--) {
                            select.innerHTML += "<option value="+y+">"+y+"년</option>";
                        }
                    })
                }
            });
        }

    }
    
    render() {
        var map;
        if(this.state.items) {
            map = this.state.items.length>0&&(<Map items={this.state.items.find((i) => i.year==this.state.year).data} bgData={this.state.bgData} sideInfo={this.sideInfo} />);
        } else {
            map = <div className='mapContainer'></div>;
        }

        var bar;
        if(this.state.selectedArea) {
            bar = this.state.items.length>0&&(<MyResponsiveBar selectedArea={this.state.selectedArea} data={this.state.items} />);
        } else {
            bar = <div className='bar'></div>;
        }

        var renewablePercentPage = (
            <div className='pageContainer'>
                {map}
                <div className='sideController'>
                    <div className='legendContainer'></div>
                    <div className='selectContainer'>
                        <select id="yearSelect" name="year" onChange={this.handleChange}></select>
                    </div>
                </div>
                <div className='totalInfo'></div>
                <div className='side'>
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
            content = renewablePercentPage;
        }

        return(
            <div className='container'>
                {content}
            </div>
        );
    }
}

export default RenewablePercent;