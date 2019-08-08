import React, { useState } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Grid, Button, Card, CardHeader, CardContent, IconButton, Typography, makeStyles } from "@material-ui/core";
import CloseIcon from "mdi-material-ui/Close";
import ImportIcon from "mdi-material-ui/Download";
import Dropzone from "react-dropzone";
import { i18next } from "/client/api";
import withCreateProduct from "../hocs/withCreateProduct";

const useStyles = makeStyles(theme => ({
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  helpText: {
    marginLeft: "20px",
    letterSpacing: "0.28px",
    fontWeight: theme.typography.fontWeightRegular
  },
  cardHeaderTitle: {
    letterSpacing: "0.3px"
  },
  cardContainer: {
    alignItems: "center"
  },
  dropzone: {
    display: "inline-block"
  }
}));

/**
 * ProductTable component
 * @param {Object} props Component props
 * @return {Node} React node
 */
function ProductTable({ onCreateProduct }) {
  const classes = useStyles();
  const [isClosed, setClosed] = useState(false);

  let displayCard;
  if ( isClosed === true ) {
    displayCard = "none";
    displayButton = "block";
  } else {
    displayCard = "block"
    displayButton = "none";
  };

  return (
    <Grid container spacing={3}>
      <Grid item sm={12} style={{ display: displayCard }}>
        <Card raised>
          <CardHeader
            className={classes.cardHeaderTitle}
            action={
              <IconButton aria-label="close">
                <CloseIcon  onClick={() => setClosed(true)} />
              </IconButton>
            }
            title="Filter products by file"
          />
          <CardContent>
            <Grid container spacing={1} className={classes.cardContainer}>
              <Grid item sm={12}>
                <Dropzone
                  className={classes.dropzone}
                  disableClick
                  multiple
                  disablePreview
                  onDrop={(files) => {
                    console.log(files)
                  }}
                  ref={(inst) => { this.dropzone = inst; }}
                  accept="csv"
                  >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      this.dropzone && this.dropzone.open();
                    }}
                  >
                    <ImportIcon className={classes.leftIcon}/>
                    Import
                  </Button>
                </Dropzone>
                <Typography variant="h5" display="inline" className={classes.helpText}>
                  Import a .csv file with a list of product IDs, separated by commas.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item sm={12} style={{ display: displayButton }}>
        <Button
          color="primary"
          onClick={onCreateProduct}
          variant="contained"
        >
          {i18next.t("admin.createProduct") || "Create product"}
        </Button>
      </Grid>
      <Grid item sm={12}>
        <Components.ProductsAdmin />
      </Grid>
    </Grid>
  );
}

ProductTable.propTypes = {
  onCreateProduct: PropTypes.func
};

export default withCreateProduct(ProductTable);
