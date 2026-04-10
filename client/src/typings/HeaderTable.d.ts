interface HeaderTable {
  label: string;
  id?: string;
  pT?: string;
  pR?: string;
  pB?: string;
  pL?: string;
  sort?: boolean;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
  isCheckBox?: boolean;
  checked?: number[];
  rowsPerPage?: number;
  isVisible?: boolean;
  handleCheckAll?: () => void;
}
