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

const ProductsTable = ({ 
  products, 
  currentPageData, 
  emptyRows, 
  openModal, 
  handleDelete 
}) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper} className={styles.tableWrapper}>
      <Table aria-label={t('adminPanel.table.productsLabel')} className={styles.table}>
        <TableHead>
          <TableRow>
            <StyledTableCell className={styles.imageColumn}>{t('adminPanel.table.image')}</StyledTableCell>
            <StyledTableCell className={styles.nameColumn}>{t('adminPanel.forms.product.nameAz')}</StyledTableCell>
            <StyledTableCell className={styles.nameColumn}>{t('adminPanel.forms.product.nameEn')}</StyledTableCell>
            <StyledTableCell className={styles.categoryColumn}>{t('adminPanel.forms.product.category')}</StyledTableCell>
            <StyledTableCell className={styles.priceColumn} align="right">{t('adminPanel.forms.product.price')}</StyledTableCell>
            <StyledTableCell className={styles.discountColumn} align="center">{t('adminPanel.forms.product.hasDiscount')}</StyledTableCell>
            <StyledTableCell className={styles.discountPercentColumn} align="center">{t('adminPanel.forms.product.discountPercentage')}</StyledTableCell>
            <StyledTableCell className={styles.stockColumn} align="center">{t('adminPanel.forms.product.inStock')}</StyledTableCell>
            <StyledTableCell className={styles.actionsColumn} align="center">{t('adminPanel.table.actions')}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentPageData.map((item) => (
            <StyledTableRow key={item.id}>
              <StyledTableCell className={styles.tableCellImage}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.nameEn}
                    className={styles.productImage}
                  />
                )}
              </StyledTableCell>
              <StyledTableCell>
                <span className={styles.productNameCell}>{item.nameAz || t('common.noProductName')}</span>
              </StyledTableCell>
              <StyledTableCell>
                <span className={styles.productNameCell}>{item.nameEn || t('common.noProductName')}</span>
              </StyledTableCell>
              <StyledTableCell>{item.main_category}</StyledTableCell>
              <StyledTableCell align="right">
                <span className={styles.priceValue}>₼{Number(item.price).toFixed(2)}</span>
              </StyledTableCell>
              <StyledTableCell align="center">
                {item.isDiscount ? '✅' : '❌'}
              </StyledTableCell>
              <StyledTableCell align="center">
                {item.isDiscount ? `${item.discount}%` : '-'}
              </StyledTableCell>
              <StyledTableCell align="center">
                {item.instock ? '✅' : '❌'}
              </StyledTableCell>
              <StyledTableCell align="center">
                <div className={styles.actionButtons}>
                  <button
                    className={styles.editButton}
                    onClick={() => openModal("product", "edit", item)}
                  >
                    ✏️ {t('adminPanel.actions.edit')}
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete("product", item.id)}
                  >
                    🗑️ {t('adminPanel.actions.delete')}
                  </button>
                </div>
              </StyledTableCell>
            </StyledTableRow>
          ))}
          {emptyRows > 0 && (
            <StyledTableRow style={{ height: 73 * emptyRows }}>
              <StyledTableCell colSpan={9} />
            </StyledTableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsTable; 