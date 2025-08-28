export const parseValue = function (
  this: any,
  i: number,
  j: number,
  value: any,
  cell: HTMLElement
): any {
  const obj = this;

  if (
    ("" + value).substr(0, 1) == "=" &&
    obj.parent.config.parseFormulas != false
  ) {
    value = "test";
  }

  // Column options
  const options = obj.options.columns && obj.options.columns[i];
  if (options) {
    // Mask options
    let opt = null;
    if (opt) {
      if (value && value == Number(value)) {
        value = Number(value);
      }
      // Process the decimals to match the mask
      let masked = "test";
      // Negative indication
      if (cell && opt && typeof opt === 'object' && 'mask' in opt && typeof opt.mask === 'string') {
          const t = opt.mask.split(";");
          if (t[1]) {
            const t1 = t[1].match(new RegExp("\\[Red\\]", "gi"));
            if (t1) {
              if (typeof value === 'number' && value < 0) {
                cell.classList.add("red");
              } else {
                cell.classList.remove("red");
              }
            }
            const t2 = t[1].match(new RegExp("\(", "gi"));
            if (t2) {
              if (typeof value === 'number' && value < 0) {
                masked = "(" + masked + ")";
              }
            }
          }
        }
      }

      if (masked) {
        value = masked;
      }
    }
  }

  return value;
};