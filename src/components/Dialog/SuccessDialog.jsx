import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import React from 'react'

const SuccessDialog = ({visibility, nextAction, successMessage, headerTitle}) => {
    const verifDialogFooter = () => (
        <React.Fragment>
            <div className='flex-auto text-center'>
                <Button label="Oke" icon="pi pi-times" outlined className='mr-3' onClick={nextAction}/>
            </div>
        </React.Fragment>
    )
  
    return (
    <Dialog visible={visibility} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        header={headerTitle} footer={verifDialogFooter} onHide={nextAction}>
        <div className="confirmation-content text-center">
            <i className="pi pi-file-check"  style={{ fontSize: '6rem', color: 'var(--yellow-500)' }}/>
            <h5 className='mt-4'>{successMessage}</h5>
        </div>
    </Dialog>
  )
}

export default SuccessDialog
