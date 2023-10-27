export const parseKey = (
  s: string
): {
  name: string;
  type: "boolean" | "string" | "multiselect" | "number" | "date" | "file";
  modifier: "optional" | "required";
} => {
  let key: {
    name: string;
    type: "boolean" | "string" | "multiselect" | "file" | "number" | "date";
    modifier: "optional" | "required";
  } = {
    name: "",
    type: "string",
    modifier: "required",
  };

  if (s[s.length - 1] === "?") {
    key.modifier = "optional";
    s = s.substring(0, s.length - 1);
  }

  let prefix = s[0];

  switch (prefix) {
    case "&":
    case "^":
    case "+":
    case "@":
    case "#":
      key.name = s.substring(1);

      key.type = prefix === "&" ? "boolean" : "number";
      if (prefix == "^") {
        key.type = "date";
      } else if (prefix == "@") {
        key.type = "file";
      } else if (prefix == "#") {
        key.type = "multiselect"
      }

      break;
    default:
      key.name = s;
      break;
  }

  return key;
};

const parseValue = (
  s: any,
  type: "boolean" | "string" | "number" | "date" | "file"
): any => {
  if (s == "") {
    return s;
  }
  switch (type) {
    case "string":
      return s;
    case "number":
      return parseFloat(s);
    case "boolean":
      {
        let key = s.toUpperCase();
        switch (key) {
          case "ON":
          case "YES":
          case "TRUE":
            return true;
          case "FALSE":
          case "NO":
          case "OFF":
            return false;
        }
      }
      break;
    case "date":
      return new Date(s);
    case "file":
      return s as File;
    default:
      return s;
  }
};

export const formDataToJson = <T = any>(data: FormData): T => {
  let object: any = {};

  for (const p of data) {
    let res = parseKey(p[0]);
    let key = res.name;
    let value = parseValue(p[1], res.type === "multiselect" ? "string" : res.type);

    if (value === "" && res.modifier === "optional") continue;

    let keyArray = key.split(".");
    let keyCount = keyArray.length;

    if (keyCount > 1) {
      let finalRef = object;
      for (const [i, k] of keyArray.entries()) {
        if (!k.includes("[")) {
          if (i == keyArray.length - 1) {
            if (res.type === "multiselect") {
              if (!Array.isArray(finalRef[k])) {
                finalRef[k] = [];
              }

              finalRef[k].push(value);
            } else
              finalRef[k] = value;
          } else {
            if (!finalRef[k]) finalRef[k] = {};
            finalRef = finalRef[k];
          }
        } else {
          let array_name = k.slice(0, k.indexOf("["));
          let index = Number(k.slice(k.indexOf("[") + 1, k.indexOf("]")));

          if (!finalRef[array_name]) {
            finalRef[array_name] = [];
          }

          if (!finalRef[array_name]?.[index]) {
            if (i == keyArray.length - 1) {
              finalRef[array_name][index] = value;
            } else finalRef[array_name][index] = {};
            finalRef = finalRef[array_name][index];
          } else {
            finalRef = finalRef[array_name][index];
          }
        }
      }
    } else if (!key.includes("[")) {
      if (res.type === "multiselect") {
        if (!Array.isArray(object[key])) {
          object[key] = [];
        }

        object[key].push(value);
      } else
        object[key] = value;
    } else {
      let array_name = key.slice(0, key.indexOf("["));
      let index = Number(key.slice(key.indexOf("[") + 1, key.indexOf("]")));

      if (object.hasOwnProperty(array_name)) {
        object[array_name][index] = String(value);
      } else {
        object[array_name] = [];
        object[array_name][index] = String(value);
      }
    }
  }

  return object as T;
};


