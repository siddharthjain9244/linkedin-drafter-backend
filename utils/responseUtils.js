const responseHandler = (req, res, next) => {
  const { data, message, status } = req.data;
  res.status(status).json({ data, message });
};

export default responseHandler;