export class TransferProcurmentCDBItemsList {
  constructor(
    public ProjectID: string,
    public CDB_ID: number,
    public Del_ID: string,
    public Op_ID: string,
    public Procur_ID_Del_ID: string,
    public Procur_ID_Op_ID: string,
    public Amount: number,
    ) {}
}
