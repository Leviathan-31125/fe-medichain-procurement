import React, { useEffect, useState } from 'react'
import PageLayout from '../../layouts/PageLayout/PageLayout'
import { useLocation, useNavigate } from 'react-router-dom'
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { BASE_API_PROCUREMENT, formatDateToDB } from '../../helpers';
import axios from 'axios';
import Loading from '../../components/Loading/Loading';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
import ConfirmDialog from '../../components/Dialog/ConfirmDialog';
import './style.css';

const CreateReceivingOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {dataPO, supplier} = location.state;

  // Dialog Handler 
  const [loading, setLoading] = useState(false);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });
  const [dialogCreateRO, setDialogCreateRO] = useState(false);

  // Data Handler 
  const [dataRO, setDataRO] = useState({
    fc_rono: localStorage.getItem('userId'),
    fc_sjno: "",
    fc_warehousecode: "",
    fc_pono: dataPO.fc_pono,
    fd_roarrivaldate: ""
  });
  const [listWarehouse, setListWarehouse] = useState([]);

  const getListWarehouse = async () => {
    setLoadingWarehouse(true);

    const optionsGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/general/warehouse`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsGet)
      .then((response) => {
        setListWarehouse(response.data);
        setLoadingWarehouse(false);
        const warehousecode = response.data.filter((gudang) => gudang.fv_warehouseaddress === dataPO.fv_destination)[0].fc_warehousecode

        setDataRO((currentData) => ({
          ...currentData,
          fc_warehousecode: warehousecode
        }));
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Load Data",
          errorMessage: error.response.data.message
        });
        setLoadingWarehouse(false);
      })
  }

  const createROMST = async () => {
    setLoading(true)
    setDialogCreateRO(false)

    console.log(dataRO)
    const optionsCreate = {
      method: 'post',
      url: `${BASE_API_PROCUREMENT}/receiving-order/temp-ro-mst`,
      data: {
        ...dataRO,
        fd_roarrivaldate: formatDateToDB(dataRO.fd_roarrivaldate)
      },
      headers: {
        'Content-Type': "application/json",
        'Authorization': localStorage.getItem("accessToken")
      }
    }

    await axios.request(optionsCreate)
      .then((response) => {
        if (response.data.status === 201)
          navigate('/receiving-order/create');
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Create Data",
          errorMessage: error.response.data.message
        });
        setLoading(false);
      })
  }

  useEffect(() =>{
    getListWarehouse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const changeHandler = (event) => {
    const {name, value} = event.target;

    setDataRO((currentData) => ({
      ...currentData,
      [name]: value
    }))
  }

  return (
    <PageLayout>
      <Loading visibility={loading}/>

      <ConfirmDialog 
        visibility={dialogCreateRO} 
        cancelAction={() => setDialogCreateRO(false)} 
        submitAction={createROMST}
        confirmMessage="Yakin ingin membuat Receiving Order ?"
        headerTitle="Buat RO"
      />

      <ErrorDialog 
        visibility={errorAttribut.visibility} 
        errorMessage={errorAttribut.errorMessage} 
        headerTitle={errorAttribut.headerTitle} 
        setAttribute={setErrorAttribut}
      />

      <div className="flex gap-3">
        <Panel 
          header="Info RO" 
          className='cardPO'
          toggleable
        >
          <div className="row">
            <div className='col-lg-6 col-12 mb-2'>
              <label htmlFor="fc_pono" className='font-bold block mb-1'>No. PO</label>
              <InputText 
                id='fc_pono'
                name='fc_pono'
                value={dataRO.fc_pono} 
                className='w-full' 
                disabled
              /> 
            </div>
            <div className='col-lg-6 col-12 mb-2'>
              <label htmlFor="fc_rono" className='font-bold block mb-1'>Operator</label>
              <InputText 
                id='fc_rono'
                name='fc_rono'
                value={dataRO.fc_rono} 
                className='w-full' 
                disabled
              /> 
            </div>
            <div className='col-lg-6 col-sm-12 col-12 mb-2'>
              <label htmlFor="fc_sjno" className='font-bold block mb-1'>Surat Jalan</label>
              <InputText 
                id='fc_sjno'
                name='fc_sjno'
                value={dataRO.fc_sjno} 
                className='w-full' 
                onChange={changeHandler}
              />
            </div>
            <div className='col-lg-6 col-sm-12 col-12 mb-2'>
              <label htmlFor="fd_roarrivaldate" className='font-bold block mb-1'>Tanggal Penerimaan</label>
              <Calendar 
                id='fd_roarrivaldate'
                name='fd_roarrivaldate'
                value={dataRO.fd_roarrivaldate} 
                className='w-full' 
                dateFormat='dd-mm-yy' 
                showIcon
                onChange={changeHandler} 
              />
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-8 col-sm-12 col-12 mb-2'>
              <label htmlFor="fd_sodate_user" className='font-bold block mb-1'>Gudang Penerimaan</label>
              <Dropdown 
                id='fc_warehousecode'
                name='fc_warehousecode'
                options={listWarehouse} 
                optionLabel='fv_warehousename'
                optionValue='fc_warehousecode'
                loading={loadingWarehouse}
                value={dataRO.fc_warehousecode} 
                className='w-full'
                onChange={changeHandler}
                placeholder='Pilih Gudang'
              />
            </div>
            <div className='col-lg-4 col-sm-12 col-12 mb-2 d-flex align-items-end'>
              <Button 
                label='Buat RO'
                severity="success"
                className='w-full buttonAction'
                onClick={() => setDialogCreateRO(true)}
              />
            </div>
          </div>
        </Panel>
        <Panel 
          header="Detail Supplier" 
          className='cardSupplier'
          toggleable
        >
          <div className='row'>
            <div className='col-lg-4 col-sm-12 col-12 mb-2'>
              <label htmlFor="supplier.fv_suppliernpwp" className='font-bold block mb-1'>NPWP</label>
              <InputText value={supplier.fv_suppliernpwp} className='w-full' disabled/>
            </div>
            <div className='col-lg-2 col-sm-3 col-3 mb-2'>
              <label htmlFor="supplier.fc_legalstatus" className='font-bold block mb-1'>Legalitas</label>
              <InputText value={supplier.fc_legalstatus} className='w-full' disabled/>
            </div>
            <div className='col-lg-6 col-sm-9 col-9 mb-2'>
              <label htmlFor="supplier.fv_suppliername" className='font-bold block mb-1'>Nama Supplier</label>
              <InputText value={supplier.fv_suppliername} className='w-full' disabled/>
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-3 col-sm-12 col-12 mb-2'>
              <label htmlFor="supplier.fc_branchtype" className='font-bold block mb-1'>Status Kantor</label>
              <InputText value={supplier.fc_branchtype} className='w-full' disabled/>
            </div>
            <div className='col-lg-4 col-sm-12 col-12 mb-2'>
              <label htmlFor="supplier.fc_picname1" className='font-bold block mb-1'>PIC</label>
              <InputText value={supplier.fc_picname1} className='w-full' disabled/>
            </div>
            <div className='col-lg-5 col-sm-12 col-12 mb-2'>
              <label htmlFor="supplier.fn_agingpayable" className='font-bold block mb-1'>Batas Masa Hutang</label>
              <InputNumber value={supplier.fn_agingpayable} className='w-full' disabled/>
            </div>
          </div>
          <div className="row">
            <div className='col-lg-7 col-sm-9 col-9 mb-lg-0 mb-2'>
              <label htmlFor="supplier.fv_npwpaddress" className='font-bold block mb-1'>Alamat Customer</label>
              <InputTextarea value={supplier.fv_npwpaddress} className='w-full' rows={1}/>
            </div>
            <div className='col-lg-5 col-sm-3 col-3 mb-lg-0 mb-2'>
              <label htmlFor="supplier.fm_accountpayable" className='font-bold block mb-1'>Batas Hutang</label>
              <InputNumber value={supplier.fm_accountpayable} className='w-full' disabled/>
            </div>
          </div>
        </Panel>
      </div>
    </PageLayout>
  )
}

export default CreateReceivingOrder
