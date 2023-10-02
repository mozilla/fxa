export const mockQuery = jest
  .fn()
  .mockResolvedValue({ data: { purchaseCollection: { items: [] } } });
const mock = jest.fn().mockImplementation(() => {
  return {
    query: mockQuery,
  };
});
export const ContentfulClient = mock;
