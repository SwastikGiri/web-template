import React,{useState} from 'react'
import css from '../SearchForm/SearchForm.module.css'
import { IoIosArrowDown } from "react-icons/io";
function SearchForm() {
    const [startDate, setStartDate]=useState("");
    const [endDate, setEndDate]=useState("");
  return (
    <form className={css.searchForm}>
            <div>
                <button className={css.datePicker}>
                    <div style={{fontSize:"large",fontWeight:"initial"}}><span>Check In </span><IoIosArrowDown /></div>
                    <span style={{fontSize:"10px",fontWeight:"lighter",color:"grey"}}>Choose Start Date</span>
                </button>
              <input type='text' className={css.addressInput}/>
              <input type='date'/>
              <input type='date'/>
            </div>
            <div></div>
            <div>
              <button>Search</button>
            </div>
          </form>
  )
}

export default SearchForm