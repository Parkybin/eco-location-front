import React from "react";
import './css/Header.css';
import {Link} from 'react-router-dom';

class Header extends React.Component {
    render() { 
        return(
            <div className="headerContainer">
                <div className="nav">
                    <div className="item">
                        <Link to="/renewable-percent">재생에너지 전환율</Link>
                    </div>
                    <div className="item">
                        <Link to="/gen-total">재생에너지 발전량</Link>
                    </div>
                    <div className="item">
                        <Link to="/potential-total">재생에너지 잠재량 확인</Link>
                        <div className="dropdown">
                            <Link to="/potential-total">지역별 잠재량</Link>
                            <Link to="/potential-year">시간별 잠재량</Link>
                        </div>
                    </div>
                    <div className="item">
                        <Link to="/exist-gen">기존 발전소 확인</Link>
                    </div>
                </div>
            </div>
        )
    }
}

export default Header;