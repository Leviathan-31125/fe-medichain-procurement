import React, { useEffect, useState } from 'react'
import PageLayout from '../../layouts/PageLayout/PageLayout'
import { FilterMatchMode } from 'primereact/api';
import Loading from '../../components/Loading/Loading';
import axios from 'axios';
import { BASE_API_PROCUREMENT, formattedDateWithOutTime, getSeverity } from '../../helpers';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import ErrorDialog from '../../components/Dialog/ErrorDialog';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import TableHeader from '../../components/TableHeader/TableHeader';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const MasterReceivingOrder = () => {
  const navigate = useNavigate();

  // Dialog handler 
  const [loading, setLoading] = useState(false);
  const [errorAttribut, setErrorAttribut] = useState({
    visibility: false, 
    headerTitle: "", 
    errorMessage: ""
  });

  // Data handler 
  const [listMasterRO, setListMasterRO] = useState([]);

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
      url: `${BASE_API_PROCUREMENT}/receiving-order`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    }

    await axios.request(optionGetData)
      .then((response) => {
        setListMasterRO(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setErrorAttribut({
          visibility: true,
          headerTitle: "Gagal Load Data",
          errorMessage: error.response.data.message
        });

        setLoading(false);
      });
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

  const statusTemplate = (rowdata) => {
    let currentValue = rowdata;

    if (rowdata === 'SUBMIT') currentValue = "DITERIMA"

    return (
      <Tag value={currentValue} severity={getSeverity("STATUS", currentValue)}></Tag>
    )
  }

  const actionBodyTemplate = (data) => (
    <div className="d-flex gap-2">
      <Button className='buttonAction' outlined icon="pi pi-eye" severity='success' onClick={() => navigate('/master-ro/detail', {state: data})}/>
    </div>
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
          value={listMasterRO} dataKey='fc_rono'
          tablestyle={{minwidth:'70rem'}} 
          paginator removableSort scrollable
          rows={5} rowsPerPageOptions={[5, 10, 25, 50]}
          filters={filters} globalFilterFields={[
            'fc_rono',
            'fc_sjno',
            'fc_pono',
            'pomst.supplier.fv_suppliername',
            'fd_roarrivaldate',
            'fc_status',
            'fn_rodetail',
            'ft_description'
          ]} 
          header={renderHeader}
        >
          <Column field='fc_rono' header="No. RO" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_sjno' header="Surat Jalan" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fc_pono' header="No. PO" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='pomst.supplier.fv_suppliername' header="Supplier" sortable style={{minWidth: '10rem'}}></Column>
          <Column field='fd_roarrivaldate' header="Tgl Diterima" body={(data) => formattedDateWithOutTime(data.fd_roarrivaldate)} sortable style={{minWidth: '12rem'}}></Column>
          <Column field='fc_status' header="Status" sortable body={(data) => statusTemplate(data.fc_status)} style={{minWidth: '7rem'}}></Column>
          <Column field='fn_rodetail' header="Item" sortable style={{minWidth: '5rem'}}></Column>
          <Column field='ft_description' header="Catatan" sortable style={{minWidth: '12rem'}}></Column>
          <Column body={actionBodyTemplate} ></Column>
        </DataTable>
      </Card>

    </PageLayout>
  )
}

export default MasterReceivingOrder
