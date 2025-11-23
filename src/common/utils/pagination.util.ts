import { PaginationQueryDto } from "../dto/pagination-query.dto";

export const getPaginationParams = (query: PaginationQueryDto) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => ({
  page,
  limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / limit),
});

export const resolveOrderBy = (
  sortBy: string | undefined,
  sortOrder: "asc" | "desc" | undefined,
  allowedFields: string[],
  fallbackField: string,
  fallbackDirection: "asc" | "desc" = "desc"
) => {
  const direction = sortOrder || fallbackDirection;
  const field =
    sortBy && allowedFields.includes(sortBy) ? sortBy : fallbackField;
  return { [field]: direction } as Record<string, "asc" | "desc">;
};
