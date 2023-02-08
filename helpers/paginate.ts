export const paginate = async (
	schema: any,
	query: any,
	page: any = 1,
	documentPerPage: any = 20,
	sortFilter: object = { createdAt: -1 },
) => {
	if (Number.isNaN(Number(page)) || Number.isNaN(Number(documentPerPage)))
		throw {
			error: "ValidationError",
			message: "page or dpp must be a number",
			name: "ValidationError",
		};
	else {
		page = parseInt(page);
		documentPerPage = parseInt(documentPerPage);
	}

	if (page < 1 || documentPerPage < 1)
		throw {
			error: "ValidationError",
			message: "page and dpp must be greater than 0",
			name: "ValidationError",
		};

	const total_documents = await schema.countDocuments(query);
	const total_pages = Math.ceil(total_documents / documentPerPage);
	const limit = documentPerPage;
	const skip = (page - 1) * documentPerPage;
	const docs = await schema
		.find(query)
		.sort(sortFilter)
		.skip(skip)
		.limit(limit);
	const result: any = {
		total_documents: total_documents,
		total_pages: total_pages,
		current_page: page,
		document_per_page: documentPerPage,
	};
	if (docs.length === 0) result.message = "No documents found";
	else result.documents = docs;
	return result;
};
