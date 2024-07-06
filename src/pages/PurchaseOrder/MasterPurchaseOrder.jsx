import React, { useEffect, useState } from 'react'
import PageLayout from '../../layouts/PageLayout/PageLayout'
import Loading from '../../components/Loading/Loading'
import ErrorDialog from '../../components/Dialog/ErrorDialog'
import { useNavigate } from 'react-router-dom'
import { Card } from 'primereact/card'
import { DataTable } from 'primereact/datatable'
import { FilterMatchMode } from 'primereact/api'
import { Column } from 'primereact/column'
import { BASE_API_PROCUREMENT, formatIDRCurrency, formattedDateWithOutTime, getSeverity } from '../../helpers'
import axios from 'axios'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import TableHeader from '../../components/TableHeader/TableHeader'

const MasterPurchaseOrder = () => {
  const navigate = useNavigate();

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

  // Dialog handler 
  const [loading, setLoading] = useState(false);
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });

  // Data handler 
  const [listMasterPO, setListMasterPO] = useState([]);

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

  useEffect(() => {
    getAllMasterPO();
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
      <Button className='buttonAction' outlined icon="pi pi-eye" severity='success' onClick={() => navigate('/master-po/detail', {state: data})}/>
    </div>
  )

  const statusTemplate = (rowdata) => (
    <Tag value={rowdata} severity={getSeverity("STATUS", rowdata)}></Tag>
  )


  return (
    <PageLayout>
      <Loading visibility={loading}/>
      <ErrorDialog visibility={errorAttribut.visibility} errorMessage={errorAttribut.errorMessage} headerTitle={errorAttribut.headerTitle} setAttribute={setErrorAttribut}/>
      
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
          <Column field='fc_pono' header="No. SO" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='supplier.fv_suppliername' header="Supplier" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fd_podate_user' header="Tanggal PO" body={(data) => formattedDateWithOutTime(data.fd_podate_user)} sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fd_poexpired' header="Expired PO" body={(data) => formattedDateWithOutTime(data.fd_poexpired) } sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_status' header="Status" body={(data) => statusTemplate(data.fc_status)} sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fn_podetail' header="Item" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fm_netto' header="Total" body={(data) => formatIDRCurrency(data.fm_netto)} sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_potransport' header="Transport" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fv_destination' header="Destinasi" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='ft_description' header="Catatan" sortable style={{minWidth: '10rem'}}></Column>
          <Column body={actionBodyTemplate} ></Column>
        </DataTable>
      </Card>
    </PageLayout>
  )
}

export default MasterPurchaseOrder
