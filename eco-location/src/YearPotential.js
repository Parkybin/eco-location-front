import React from 'react';
import './css/YearPotential.css';
import PotentialGraph from './PotentialGraph';
import { call_for_not_es } from './service/ApiService';

class YearPotential extends React.Component { // 시간별 잠재량 페이지
    constructor(props) {
        super(props);
        this.state = {
            startYear: "",
            startMonth: "",
            endYear: "",
            endMonth: "",
            today: "",
            items: [],
            isEmpty: true,
            loading: true
        };
    }
    
    drawGraph = () => { // 말이 draw지 사실상 componentDidUpdate 그런데 datetime만 반응하는
        if(!this.state.startYear||!this.state.startMonth||!this.state.endYear||!this.state.endMonth) {
            var emptyData = [
                { "areaName": "전라남도", "태양에너지":9500, "풍력에너지":0 },
                { "areaName": "경상북도", "태양에너지":0, "풍력에너지":0 },
                { "areaName": "강원도", "태양에너지":0, "풍력에너지":0 },
                { "areaName": "제주도", "태양에너지":0, "풍력에너지":0 },
                { "areaName": "충청남도", "태양에너지":0, "풍력에너지":0 },
                { "areaName": "충청북도", "태양에너지":0, "풍력에너지":0 },
                { "areaName": "경상남도", "태양에너지":0, "풍력에너지":0 },
                { "areaName": "전라북도", "태양에너지":0, "풍력에너지":0 },
                { "areaName": "경기도", "태양에너지":0, "풍력에너지":0 }
            ];
            this.setState({isEmpty: true, items:emptyData});
            return;
        }

        // 사용자로부터 입력받은 날짜와 시간
        var start = this.state.startYear + "-" + this.state.startMonth;
        var end = this.state.endYear + "-" + this.state.endMonth;
        
        // start가 더 늦을경우
        if(new Date(start)>new Date(end)) {
            var tmp = start;
            start = end;
            end = tmp;
        }
        
        var endDate = new Date(this.state.endYear, this.state.endMonth, 0).getDate()
        start += "-01 00:00:00";
        end += "-" + endDate + " 23:59:59";
        
        // 로딩 중에 선택 막기
        var selectWrap = document.querySelectorAll(".selectWrap");
        selectWrap.forEach((wrap)=>{
            Array.from(wrap.children).forEach((select)=>{
                select.disabled=true;
            })
        });

        // 로딩 표시
        var emptyInfo = document.querySelector(".emptyInfo");
        emptyInfo.innerHTML = "로딩중...";
        emptyInfo.style.display="block";

        // 실제 데이터 요청
        call_for_not_es("/energy-potential?from="+start+"&to="+end, "GET", null).then((response) =>
            this.setState(this.dataCleaning(response), () => {
                emptyInfo.innerHTML = "조회된 데이터가 없습니다.";
                if(!this.state.isEmpty) emptyInfo.style.display="none";
                selectWrap.forEach((wrap)=>{
                    Array.from(wrap.children).forEach((select)=>{
                        select.disabled=false;
                    })
                });
            })
        );
    }

    dataCleaning = function(items) {
        // 실전 코드
        // 변수명이 어째서 korean인가 하면 표 그릴때 keys 이름 바꾸는 법을 모르겠습니다
        var result = [
            { "areaName": "전라남도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "경상북도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "강원도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "제주도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "충청남도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "충청북도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "경상남도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "전라북도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "경기도", "태양에너지":0, "풍력에너지":0 }

        ];
        if(!items) {
            return {items:result, isEmpty:true};
        }

        items.forEach((item) => { 
            if(item.powerType==='1') {
                var area = result.find((a) => a.areaName===item.areaName);
                if(area) {
                    area.태양에너지 += item.forecastEnergyPotential;
                }
            } else {
                var area = result.find((a) => a.areaName===item.areaName);
                if(area) {
                    area.풍력에너지 += item.forecastEnergyPotential;
                }
            }
        });
        return {items:result, isEmpty:false};
    }
    
    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value }, this.drawGraph);
    }

    componentDidMount() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        var emptyData = [
            { "areaName": "전라남도", "태양에너지":9500, "풍력에너지":0 },
            { "areaName": "경상북도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "강원도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "제주도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "충청남도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "충청북도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "경상남도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "전라북도", "태양에너지":0, "풍력에너지":0 },
            { "areaName": "경기도", "태양에너지":0, "풍력에너지":0 }
        ];
        this.setState({startYear: "2022", startMonth: "08", endYear: "2022", endMonth: "12", items:emptyData, today:formattedDate, loading:false}, this.drawGraph);
    }
    
    render() {
        var graph = this.state.items.length>0&&(<PotentialGraph items={this.state.items} isEmpty={this.state.isEmpty}/>);
        
        var yearPotentialPage = (
            <div className='graphPageContainer'>
                <div className='datetimeContainer'>
                    기간:
                    <div className='selectWrap'>
                        <select id="startYear" name="startYear" defaultValue={"2022"} onChange={this.handleChange}>
                            <option value="2020">2020년</option>
                            <option value="2021">2021년</option>
                            <option value="2022">2022년</option>
                        </select>
                        <select id="startMonth" name="startMonth" defaultValue={"08"} onChange={this.handleChange}>
                            <option value="01">1월</option>
                            <option value="02">2월</option>
                            <option value="03">3월</option>
                            <option value="04">4월</option>
                            <option value="05">5월</option>
                            <option value="06">6월</option>
                            <option value="07">7월</option>
                            <option value="08">8월</option>
                            <option value="09">9월</option>
                            <option value="10">10월</option>
                            <option value="11">11월</option>
                            <option value="12">12월</option>
                        </select>
                    </div>
                    ㅡ
                    <div className='selectWrap'>
                        <select id="endYear" name="endYear" defaultValue={"2022"} onChange={this.handleChange}>
                            <option value="2020">2020년</option>
                            <option value="2021">2021년</option>
                            <option value="2022">2022년</option>
                        </select>
                        <select id="endMonth" name="endMonth" defaultValue={"12"} onChange={this.handleChange}>
                            <option value="01">1월</option>
                            <option value="02">2월</option>
                            <option value="03">3월</option>
                            <option value="04">4월</option>
                            <option value="05">5월</option>
                            <option value="06">6월</option>
                            <option value="07">7월</option>
                            <option value="08">8월</option>
                            <option value="09">9월</option>
                            <option value="10">10월</option>
                            <option value="11">11월</option>
                            <option value="12">12월</option>
                        </select>
                    </div>
                </div>
                {graph}
                <h2 className="emptyInfo">조회된 데이터가 없습니다.</h2>
            </div>
        );

        var loadingPage = <h1>...</h1>
        var content = loadingPage;

        if(!this.state.loading) {
            console.log("loading end");
            content = yearPotentialPage;
        }

        return (
            <div className='container'>
                {content}
            </div>
        );
    }  
}

export default YearPotential;