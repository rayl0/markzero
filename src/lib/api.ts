import { Prisma } from "@prisma/client";
import { json } from "@sveltejs/kit";
import type { z } from "zod";

export type XLSXValidationError = { row: number; errors: ({ key: string; error: string })[]; message: string[] };
export function zodToXLSXValidationErrors<T>(error: z.SafeParseError<T>) {
  let validationErrors: XLSXValidationError[] = [];

  validationErrors = error.error.issues.reduce<XLSXValidationError[]>(
    (acc, v) => {
      const index = acc.findIndex((s) => s.row === v.path[0]);

      if (index < 0)
        acc.push({
          row: Number(v.path[0]),
          errors: [
            {
              key: String(v.path[1]),
              error: v.message
            }
          ],
          message: [[v.path[1], ":", v.message].join(" ")],
        });
      else {
        acc[index].message.push([v.path[1], ":", v.message].join(" "))
        acc[index].errors.push({ key: String(v.path[1]), error: v.message });
      };

      return acc;
    },
    []
  );

  return validationErrors;
}

export function jsons(data: Record<any, any>, status: number = 200) {
  return json(data, {
    status: status,
  });
}

export type FailDataType =
  | {
    type: "Validation";
    errors: Record<string, string[]>;
  }
  | {
    type: "XLSX-Validation";
    fileName: string;
    errors: XLSXValidationError[];
  }
  | {
    type: "Logic" | "Query";
    error: string;
  }
  | {
    type: "Database";
    code?: string;
    meta?: Record<string, unknown>;
    message: string;
  };

export function jsonf(data: FailDataType, status: number = 400) {
  return json(data, {
    status: status,
  });
}

export function isPrismaError(e: Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientValidationError) {
  if (e instanceof Prisma.PrismaClientKnownRequestError || e instanceof Prisma.PrismaClientUnknownRequestError || e instanceof Prisma.PrismaClientValidationError) {
    return true;
  }

  return false;
}

export function handlePrismaError(
  e:
    | Prisma.PrismaClientKnownRequestError
    | Prisma.PrismaClientUnknownRequestError
    | Prisma.PrismaClientValidationError,
  handleKnownErrorMessage:
    | ((e: Prisma.PrismaClientKnownRequestError) => string | FailDataType)
    | undefined = undefined
) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {

    const res = handleKnownErrorMessage ? handleKnownErrorMessage(e) : e.message;

    if (typeof res === "string") {
      let response: FailDataType = {
        type: "Database",
        code: e.code,
        meta: e.meta,
        message: res,
      };

      return jsonf(response);
    } else {
      return jsonf(res);
    }
  } else if (e instanceof Prisma.PrismaClientValidationError) {
    let response: FailDataType = {
      type: "Database",
      message: e.message,
    };

    return jsonf(response);
  } else {
    let response: FailDataType = {
      type: "Database",
      code: "Unkown",
      message: "A unexpected Error occured in the database",
    };
    return jsonf(response);
  }
}

export function zodToValidationErrors<T>(error: z.SafeParseError<T>) {
  let validationErrors: Record<string, string[]> = {};

  validationErrors = error.error.issues.reduce<Record<string, string[]>>(
    (acc, v) => {
      let path = v.path
        .reduce<string[]>((acc, v) => {
          typeof v === "string" ? acc.push(v) : acc.push("[" + v + "]");
          return acc;
        }, [])
        .reduce<string>((acc, v, i, arr) => {
          acc += v;

          if (i + 1 <= arr.length - 1 && arr[i + 1].startsWith("[")) return acc;
          if (i != arr.length - 1) acc += ".";
          return acc;
        }, "");

      if (!acc[path]) {
        acc[path] = [];
      }

      acc[path].push(v.message);

      return acc;
    },
    {}
  );

  return validationErrors;
}

export function toJSON<T = any>(text: string) {
  return JSON.parse(text, (key, value) => {
    if (typeof value !== "string") return value;
    if (
      /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i.test(
        value
      )
    ) {
      return new Date(value);
    }

    return value;
  }) as T;
}

export async function apiCall<T = any, H = FailDataType>(
  fetch: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => Promise<Response>,
  inputs:
    | {
      input: string;
      method: "POST";
      body: any;
    }
    | {
      input: string;
      method: "GET";
    }
): Promise<
  { success: false; data: H } | { success: true; data: T }
> {
  const opts = {
    method: inputs.method,
    input: inputs.input,
    body: inputs.method === "POST" ? inputs.body : undefined,
  };

  const res = await fetch(inputs.input, opts);

  const data = toJSON(await res.text());
  if (res.status !== 200) {
    return { success: false, data: data as H };
  }

  return { success: true, data };
}
