export const paginate = async (
  schema: any,
  query: any,
  page: number = 1,
  documentPerPage: number = 20,
  sortFilter: object = { createdAt: -1 }
) => {
  var total_documents = await schema.countDocuments(query);
  var total_pages = Math.ceil(total_documents / documentPerPage);
  var limit = documentPerPage;
  var skip = (page - 1) * documentPerPage;
  var docs = await schema.find(query).sort(sortFilter).skip(skip).limit(limit);
  var result: any = {
    total_documents: total_documents,
    total_pages: total_pages,
    current_page: page,
    document_per_page: documentPerPage,
  };
  if (docs.length === 0) result.message = "No documents found";
  else result.documents = docs;
  return result;
};
