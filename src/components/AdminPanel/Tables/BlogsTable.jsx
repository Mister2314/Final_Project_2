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

const BlogsTable = ({ 
  currentPageData, 
  emptyRows, 
  openModal, 
  handleDelete 
}) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table aria-label={t('adminPanel.table.blogsLabel')}>
        <TableHead>
          <TableRow>
            <StyledTableCell>{t('adminPanel.table.image')}</StyledTableCell>
            <StyledTableCell>{t('adminPanel.forms.blog.titleAz')}</StyledTableCell>
            <StyledTableCell>{t('adminPanel.forms.blog.titleEn')}</StyledTableCell>
            <StyledTableCell>{t('adminPanel.forms.blog.category')}</StyledTableCell>
            <StyledTableCell align="center">{t('adminPanel.table.actions')}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentPageData.map((item) => (
            <StyledTableRow key={item.id}>
              <StyledTableCell>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.blogTitle_az}
                    className={`${styles.productImage} ${styles.productImageCell}`}
                  />
                )}
              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                <div className={styles.productNameCell}>
                  {item.blogTitle_az || t('common.noTitle')}
                </div>
              </StyledTableCell>
              <StyledTableCell>
                {item.blogTitle_en || t('common.noTitle')}
              </StyledTableCell>
              <StyledTableCell>
                <span className={styles.categoryBadge}>
                  {item.blogCategory || t('common.noCategory')}
                </span>
              </StyledTableCell>
              <StyledTableCell align="center">
                <div className={styles.actionButtons}>
                  <button
                    className={styles.editButton}
                    onClick={() => openModal("blog", "edit", item)}
                  >
                    ✏️ {t('adminPanel.actions.edit')}
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete("blog", item.id)}
                  >
                    🗑️ {t('adminPanel.actions.delete')}
                  </button>
                </div>
              </StyledTableCell>
            </StyledTableRow>
          ))}
          {emptyRows > 0 && (
            <StyledTableRow style={{ height: 73 * emptyRows }}>
              <StyledTableCell colSpan={5} />
            </StyledTableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BlogsTable; 