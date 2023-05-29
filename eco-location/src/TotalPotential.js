import React from 'react';
import './css/TotalPotential.css';
import Map from './PotentialMap';
import {call} from './service/ApiService';
import { ResponsivePie } from '@nivo/pie'

class MyResponsivePie extends React.Component { // 전체 데이터 파이 그래프...
    render() {
        var valueKey;
        if(this.props.by==='total') valueKey = 'potentialAmount';
        else if(this.props.by==="source1") valueKey = "solarEnergyPotential";
        else valueKey = "windEnergyPotential";
    
        console.log(this.props.data);
        return ( 
            <ResponsivePie
                data={this.props.data}
                id="areaName"
                value={valueKey}
                margin={{ top: 40, right: 90, bottom: 80, left: 90 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={0}
                sortByValue={true}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            0.2
                        ]
                    ]
                }}
                defs={[{
                    id: 'lines',
                    type: 'patternLines',
                    background: 'inherit',
                    color: 'rgba(255, 255, 255, 0.3)',
                    rotation: -45,
                    lineWidth: 6,
                    spacing: 10
                }]}
                fill={[
                    {
                        match: {id: '충청남도'},
                        id: 'lines'
                    }, {
                        match: {id: '충청북도'},
                        id: 'lines'
                    }, {
                        match: {id: '경기도'},
                        id: 'lines'
                    }
                ]}
                valueFormat={value => `${Math.round(value/10)/100}kW`}
                arcLabel={(d) => `${Math.round((d.value)/10)/100}`}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            2
                        ]
                    ]
                }}
            />
        );
    }
}

class TotalPotential extends React.Component { // 지역별 잠재량 페이지
    constructor(props) {  
        super(props);
        this.state = {
            by: "",
            bgData: {},
            totalData: [],
            sourceData: [],
            loading: true,
        };
    }

    calcBackgroundColor = (items) => {
        var maxValue, minValue, d, bg0, bg1;
        if(this.state.by=="total") {
            maxValue = items.reduce((max, p) => p.potentialAmount > max ? p.potentialAmount : max, items[0].potentialAmount); 
            minValue = items.reduce((min, p) => p.potentialAmount < min ? p.potentialAmount : min, items[0].potentialAmount); 
            d = (maxValue-minValue+1)/10;
            bg0 = "#22";
            bg1 = "F22";
        } else if(this.state.by=="source1") {
            maxValue = items.reduce((max, p) => p.solarEnergyPotential > max ? p.solarEnergyPotential : max, items[0].solarEnergyPotential); 
            minValue = items.reduce((min, p) => p.solarEnergyPotential < min ? p.solarEnergyPotential : min, items[0].solarEnergyPotential); 
            d = (maxValue-minValue+1)/10;
            bg0 = "#";
            bg1 = "F0000";
        } else if(this.state.by=="source2") {
            maxValue = items.reduce((max, p) => p.windEnergyPotential > max ? p.windEnergyPotential : max, items[0].windEnergyPotential); 
            minValue = items.reduce((min, p) => p.windEnergyPotential < min ? p.windEnergyPotential : min, items[0].windEnergyPotential); 
            d = (maxValue-minValue+1)/10;
            bg0 = "#2222";
            bg1 = "F";
        }

        var newbgData = {"min": minValue, "d": d, "bg0": bg0, "bg1": bg1};
        if(JSON.stringify(this.state.bgData)!=JSON.stringify(newbgData)) {
            this.setState({bgData: newbgData}, () => {this.drawLegend()});
        } 
    }

    drawLegend = () => {
        var legendContainer = document.querySelector(".legendContainer");
        legendContainer.innerHTML = "";
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
        unit.innerHTML = "* 단위: W/m²"
        legendContainer.appendChild(unit);
    };
    
    checkHandler = (e) => {
        // 일단 둘다 풀면 둘다 체크되도록 했음... 다 풀리면 지도만 띄우는게 맞나? 
        var checkboxs = document.getElementsByClassName("checkbox");
        if(checkboxs[0].checked && checkboxs[1].checked) {  // 둘다 체크
            this.setState({by:"total"}, () => {this.calcBackgroundColor(this.state.totalData); this.sideInfo();});
        } else if(checkboxs[0].checked && !checkboxs[1].checked) {
            this.setState({by:"source1"}, () => {this.calcBackgroundColor(this.state.sourceData); this.sideInfo();});
        } else if(!checkboxs[0].checked && checkboxs[1].checked) {
            this.setState({by:"source2"}, () => {this.calcBackgroundColor(this.state.sourceData); this.sideInfo();});
        } else if(!checkboxs[0].checked && !checkboxs[1].checked) { // 둘다 미체크
            checkboxs[0].checked = true;
            checkboxs[1].checked = true;
            this.setState({by:"total"}, () => {this.calcBackgroundColor(this.state.totalData)});
        }
    }

    sideInfo = () => {
        // 수정) 지도따라 전체데이터 + 설명 띄우기
        var title = document.querySelector(".title");
        var info = document.querySelector(".info");

        const year = new Date().getFullYear() -1;
        if(this.state.by==="total") {
            title.innerHTML = "잠재량 총합<hr/>";
            info.innerHTML = "<div class='small'>* 단위: kW</div><br/>"+
                            "일사량이 가지고 있는 잠재량에 설비용량을 적용하여 에너지 생산량을 추정하여 제공<br/><br/>"+
                            "풍속이 가지고 있는 잠재량에 설비용량을 적용하여 에너지 생산량을 추정하여 제공"+
                            "<div class='small'>* "+year+"년 자료</div>";
        } else if(this.state.by==="source1") {
            title.innerHTML = "태양에너지 잠재량 총합<hr/>";
            info.innerHTML = "<div class='small'>* 단위: kW</div><br/>"+
                            "일사량이 가지고 있는 잠재량에 설비용량을 적용하여 에너지 생산량을 추정하여 제공"+
                            "<div class='small'>* "+year+"년 자료</div>";
        } else if(this.state.by==="source2") {
            title.innerHTML = "풍력에너지 잠재량 총합<hr/>";
            info.innerHTML = "<div class='small'>* 단위: kW</div><br/>"+
                            "풍속이 가지고 있는 잠재량에 설비용량을 적용하여 에너지 생산량을 추정하여 제공"+
                            "<div class='small'>* "+year+"년 자료</div>";
        }
        
    }
    
    componentDidMount() {
        // 실제 사용
        const year = new Date().getFullYear() -1;
        call("/energy-potential/source?year="+year, "GET", null).then((response) =>
            this.setState({by:"total", totalData:response, loading:false}, () => {
                this.calcBackgroundColor(response); 
                this.sideInfo();
            })
        );
            
        call("/energy-potential/source-type?year="+year, "GET", null).then((response) =>
            this.setState({sourceData:response})
        );
    }
    
    render() {
        var map, pie;
        if(this.state.totalData&&this.state.by=="total") {
            map = this.state.totalData.length>0&&(<Map by={this.state.by} items={this.state.totalData} bgData={this.state.bgData} />);
            pie = this.state.totalData.length>0&&(<MyResponsivePie by={this.state.by} data={this.state.totalData} />);
        } else if (this.state.sourceData) {
            map = this.state.sourceData.length>0&&(<Map by={this.state.by} items={this.state.sourceData} bgData={this.state.bgData} />);
            pie = this.state.totalData.length>0&&(<MyResponsivePie by={this.state.by} data={this.state.sourceData} />);
        } else {
            map = <div className='mapContainer'></div>
            pie = <div className='pieContainer'></div>
        }

        var totalPotentialPage = (
        <div className='pageContainer'>
            {map}
            <div className='sideController'>
                <div className='legendContainer'></div>
                <div className='checkboxContainer'>
                    <label style={{color:"red"}}>
                        <input className='checkbox' type="checkbox" onChange={this.checkHandler} defaultChecked="true" />태양에너지
                    </label>
                    <label style={{color:"blue"}}>
                        <input className='checkbox' type="checkbox" onChange={this.checkHandler} defaultChecked="true" />풍력에너지
                    </label>
                </div>
            </div>
            <div className='side'>
                <div className='title'></div>
                <div className="pieContainer">
                    {pie}
                </div>
                <div className='info'></div>
            </div>
        </div>
        );

        var loadingPage = <h1>...</h1>
        var content = loadingPage;

        if(!this.state.loading) {
            console.log("loading end");
            content = totalPotentialPage;
        }

        return(
            <div className='container'>
                {content}
            </div>
        );
    }
}

export default TotalPotential;