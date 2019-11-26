public with sharing class DataTableWithRowActionController {
    
    @AuraEnabled(cacheable=true)
    public static list<Lead> getLeads(){
        
        return [Select Id, Name, Phone, Email, Company 
                From Lead limit 20];
    }
}