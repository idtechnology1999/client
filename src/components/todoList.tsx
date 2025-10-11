import axios from "axios";

import { useState, useEffect } from "react";
const api_url_base = import.meta.env.VITE_API_BASE_URL;

export default function TodoList() {
const [add, setadd] = useState("")
const [message, setmessage] = useState("")
const [fetch, setfetch] = useState("")

const addbtn = ()=>{
axios.post(`${api_url_base}/api/addTask`, {add: add})
.then((res)=>{
    setmessage(res.data.added)
})
}

// fetch all from databse

useEffect(()=>{
        axios.get(`${api_url_base}/api/fetchAll`)
        .then((fetchdata)=>{
        console.log(fetchdata)
        setfetch(fetchdata.data.Alldata)
        })
        .catch(()=>setfetch("no data yet"))
},[])


  return (
    <div className="container py-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4">
          <h3 className="text-center mb-4 fw-bold text-primary">

                {message && <><div
                    className="alert alert-primary" role="alert">
                    <h4 className="alert-heading">alert Message</h4>
                    <p>message</p>
                    <hr />
                    <p className="mb-0">{message}</p>
                </div>
                </>}

            <i className="bi bi-check2-square me-2"></i>My Todo List
          </h3>

          <div className="input-group mb-4">
            <input type="text" onChange={(e)=>setadd(e.target.value)} value={add} className="form-control form-control-lg rounded-start-3" placeholder="Add a new task..." />
            <button className="btn btn-primary btn-lg rounded-end-3" onClick={addbtn}>
              <i className="bi bi-plus-circle"></i>
            </button>
          </div>

          <ul className="list-group list-group-flush">


        {fetch.length === 0?
        <>  <li className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom py-3">
              <div className="form-check">
                <input className="form-check-input me-2" type="checkbox" value="" id="task1" />
                <label className="form-check-label" htmlFor="task1">
                  No data yet in the box
                </label>
              </div>
              <div>
                <i className="bi bi-pencil-square text-success me-3" role="button"></i>
                <i className="bi bi-trash text-danger" role="button"></i>
              </div>
            </li></>:
        <><li>data extis</li></>
        }

          

          </ul>

          <div className="text-center mt-4">
            <button className="btn btn-outline-primary rounded-pill px-4 py-2">
              <i className="bi bi-trash3 me-2"></i>Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
