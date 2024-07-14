import React, { useEffect, useState } from 'react'
import PageLayout from '../../layouts/PageLayout/PageLayout'
import Loading from '../../components/Loading/Loading';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { BASE_API_PROCUREMENT, formatIDRCurrency, formattedDateWithOutTime, getSeverity } from '../../helpers';
import TableHeader from '../../components/TableHeader/TableHeader';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
// import './style.css';

const PreviewListPO = () => {
  const navigate = useNavigate();

  // Dialog Handler 
  const [loading, setLoading] = useState(false);
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });

  // Data Handler 
  const [listMasterPO, setListMasterPO] = useState([]);

  // Filter primereact 
  const [ filters, setFilters ] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }) 
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = {...filters}

    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }

  const getAllMasterPO = async () => {
    setLoading(true)

    const optionGetData = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/purchase-order`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionGetData)
      .then((response) => {
        setListMasterPO(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Load Data",
          errorMessage: error.response.data.message
        });

        setLoading(false);
      })
  }

  const checkROMST = async () => {
    setLoading(true);
    const rono = window.btoa(localStorage.getItem('userId'));

    const optionsGet = {
      method: 'get',
      url: `${BASE_API_PROCUREMENT}/receiving-order/temp-ro-mst/check/${rono}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionsGet)
      .then((response) => {
        if(response.data.available) navigate('/receiving-order/create');
        else setLoading(false);
      })
      .catch(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    checkROMST();
    getAllMasterPO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const renderHeader = () => {
    return <TableHeader
      globalFilterValue={globalFilterValue}
      onGlobalFilterChange={onGlobalFilterChange}
      iconHeader="fas fa-clipboard-list iconHeader"
    />
  };

  const actionBodyTemplate = (data) => (
    <div className="d-flex gap-2">
      <Button 
        label='Pilih PO'
        className='buttonAction' 
        severity='success' 
        onClick={() => navigate(`/receiving-order/detail-po/${window.btoa(data.fc_pono)}`)}
        style={{
          padding:  '8px',
          fontSize: '14px'
        }}
      />
    </div>
  )

  const statusTemplate = (rowdata) => (
    <Tag 
      value={rowdata} 
      severity={getSeverity("STATUS", rowdata)}
    />
  )

  return (
    <PageLayout>
      <Loading visibility={loading}/>

      <ErrorDialog 
        visibility={errorAttribut.visibility} 
        errorMessage={errorAttribut.errorMessage} 
        headerTitle={errorAttribut.headerTitle} 
        setAttribute={setErrorAttribut}
      />

      <Card title="Daftar Purchase Order">
        <DataTable
          value={listMasterPO} dataKey='fc_pono'
          tablestyle={{minwidth:'70rem'}} 
          paginator removableSort scrollable
          rows={5} rowsPerPageOptions={[5, 10, 25, 50]}
          filters={filters} globalFilterFields={[
            'fc_pono',
            'fd_poexpired',
            'fc_suppliertaxcode',
            'fc_potransport',
            'fv_destination',
            'fn_podetail',
            'fd_podate_user',
            'fc_status',
            'fm_disctotal',
            'fm_taxvalue',
            'fm_brutto',
            'fm_netto',
            'fm_downpayment',
            'ft_description'
          ]} 
          header={renderHeader}
        >
          <Column field='fc_pono' header="No. RO" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='supplier.fv_suppliername' header="Supplier" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fd_podate_user' header="Tanggal PO" body={(data) => formattedDateWithOutTime(data.fd_podate_user)} sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fd_poexpired' header="Expired PO" body={(data) => formattedDateWithOutTime(data.fd_poexpired) } sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_status' header="Status" body={(data) => statusTemplate(data.fc_status)} sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fn_podetail' header="Item" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='fm_netto' header="Total" body={(data) => formatIDRCurrency(data.fm_netto)} sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_potransport' header="Transport" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fv_destination' header="Destinasi" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='ft_description' header="Catatan" sortable style={{minWidth: '10rem'}}></Column>
          <Column body={actionBodyTemplate} style={{minWidth: '10rem'}}></Column>
        </DataTable>
      </Card>
    </PageLayout>
  )
}

export default PreviewListPO
