import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import { green } from "@material-ui/core/colors";
import { Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  avatar: {
    backgroundColor: ({ backgroundColor }) => backgroundColor,
    color: ({ color }) => color,
    width: theme.spacing(8),
    height: theme.spacing(8),
    fontSize: theme.typography.h4.fontSize,
  }
}));

export const AppIcon = ({ name, icon, backgroundColor, color }) => {
  const classes = useStyles({ backgroundColor: backgroundColor || green[50], color: color || green[400] });
  return (
    <Button className={classes.root}>
      <Avatar className={classes.avatar}>
        {icon || name[0].toUpperCase()}
      </Avatar>
    </Button>
  );
};