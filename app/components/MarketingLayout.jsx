import classes from './MarketingLayout.module.css';

export function MarketingLayout({ children }) {
  return (
    <div className={classes.wrapper}>
      {/* BACKGROUND ELEMENTS */}
      <div className={classes.blob1} />
      <div className={classes.blob2} />
      <div className={classes.grainyOverlay} />
      
      {/* PAGE CONTENT */}
      <div className={classes.content}>
        {children}
      </div>
    </div>
  );
}
