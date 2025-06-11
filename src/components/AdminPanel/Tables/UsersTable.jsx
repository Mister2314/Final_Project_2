import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { StyledTableCell, StyledTableRow } from '../StyledTableComponents';
import styles from '../AdminPanel.module.css';

const UsersTable = ({ 
  currentPageData, 
  emptyRows, 
  openModal, 
  handleDelete: onDelete 
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleTranslation = (role) => {
    if (role === 'admin') {
      return t('adminPanel.forms.user.admin');
    }
    return t('adminPanel.table.regularUser');
  };

  return (
    <TableContainer component={Paper} className={styles.tableWrapper}>
      <Table aria-label={t('adminPanel.table.usersLabel')} className={styles.table}>
        <TableHead>
          <TableRow>
            <StyledTableCell>{t('adminPanel.table.username')}</StyledTableCell>
            <StyledTableCell>{t('adminPanel.table.email')}</StyledTableCell>
            <StyledTableCell>{t('adminPanel.table.userRole')}</StyledTableCell>
            <StyledTableCell>{t('adminPanel.table.createdAt')}</StyledTableCell>
            <StyledTableCell align="center">{t('adminPanel.table.actions')}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentPageData.map((item) => (
            <StyledTableRow key={item.id}>
              <StyledTableCell>
                {item.username || t('common.noUsername')}
              </StyledTableCell>
              <StyledTableCell>
                {item.email || t('common.noEmail')}
              </StyledTableCell>
              <StyledTableCell>
                <span className={`${styles.roleBadge} ${styles[`role${item.role.charAt(0).toUpperCase() + item.role.slice(1)}`]}`}>
                  {getRoleTranslation(item.role)}
                </span>
              </StyledTableCell>
              <StyledTableCell>
                {formatDate(item.created_at)}
              </StyledTableCell>
              <StyledTableCell align="center">
                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={() => openModal("user", "edit", item)}
                    title={t('adminPanel.actions.edit')}
                  >
                    ✏️
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => onDelete("user", item.id)}
                    title={t('adminPanel.actions.delete')}
                  >
                    🗑️
                  </button>
                </div>
              </StyledTableCell>
            </StyledTableRow>
          ))}
          {emptyRows > 0 && (
            <StyledTableRow style={{ height: 53 * emptyRows }}>
              <StyledTableCell colSpan={5} />
            </StyledTableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable; 