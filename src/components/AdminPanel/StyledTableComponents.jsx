import { styled } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { tableCellClasses } from '@mui/material/TableCell';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'var(--button-bg)',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    color: 'var(--text-color)',
    borderBottom: '1px solid var(--input-border)',
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: 'var(--card-bg)',
  },
  '&:nth-of-type(even)': {
    backgroundColor: 'var(--bg-color)',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
})); 