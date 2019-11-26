import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getLeadRecords from '@salesforce/apex/DataTableWithRowActionController.getLeads';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';


const actions = [
    {label:'View', name:'view'},
    {label:'Edit', name:'edit'},
    {label: 'Delete', name: 'delete'}
];
const columns = [
    { label:'Name', fieldName:'Name', type:'text' },
    { label:'Company', fieldName: 'Company', type:'text' },
    { label:'Phone', fieldName: 'Phone', type:'phone'},
    { label:'Email', fieldName:'Email', type:'email'},
    {
        type: 'action',
        typeAttributes : {rowActions : actions}
    }
];
export default class LightningDataTableWithRowAction extends NavigationMixin(LightningElement) {

    //reactive variables
    @track data;
    @track columns = columns;
    @track recordPageUrl;
    @track showModal = false;
    @track detail;
    //non reactive variables
    refreshResult;


    @wire(CurrentPageReference)
    pageRef;

    @wire(getLeadRecords)
    wiredResult(result) {
        this.refreshResult = result;
        if(result.data) {
            this.data = result.data;
            this.error = undefined;
        }
        else if(result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }

    handleRowAction(event) {

        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.detail = row;

        switch(actionName) {
            case 'view':
                console.log('view');
                this.handleNavigateToViewRecord(row);
                break;
            case 'edit':
                console.log('edit');
                this.handleNavigateToEditRecord(row);
                break;
            case 'delete' :
                this.showModal = true;
                //this.handleDelete(row);
                console.log('delete');
        }
    }

    handleNavigateToViewRecord(row) {
        
        this[NavigationMixin.Navigate] ({
            type : 'standard__recordPage',
            attributes : { 
                recordId : row.Id,
                objectApiName : 'Lead',
                actionName : 'view'
            }
        });
    }
    handleNavigateToEditRecord(row) {

        this[NavigationMixin.Navigate] ({
            type : 'standard__recordPage',
            attributes : {
                recordId : row.Id,
                objectApiName : 'Lead',
                actionName : 'edit'
            }
        })
    }

    proceedDelete() {
        this.handleDelete(this.detail);
    }
    handleDelete(row) {
        console.log('delete:::'+row.Id);
        deleteRecord(row.Id)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Record Deleted',
                    message : 'Record Deleted',
                    variant : 'success'
                })
            );
            this.showModal = false;
            return refreshApex(this.refreshResult);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Error deleting the record',
                    message : error.body.message,
                    variant : 'error'
                })
            );
        });
    }
    closeModal() {
        this.showModal = false;
    }
}