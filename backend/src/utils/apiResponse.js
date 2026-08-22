export const sendSuccess = (res, { status = 200, data = null, meta } = {}) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
};

export const sendCreated = (res, data) => sendSuccess(res, { status: 201, data });

export const sendError = (res, { status = 500, code = 'INTERNAL_ERROR', message, details }) => {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ success: false, error });
};

export const buildPageMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  hasNextPage: page * limit < total,
});
