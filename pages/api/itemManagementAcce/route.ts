import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createItemAcce,
  getItemAcces,
  updateItemAcce,
  deleteItemAcce,
} from '../../../service/itemManagementAcceService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST': {
        const { type, mobileType, category, model, quantity, brand, reorderLevel, description, code } = req.body;
        if (!model) {
          res.status(400).json({ error: 'Item Acce model is required' });
          return;
        }
        try {
          const id = await createItemAcce(req.body);
          res.status(201).json({ message: 'Item Acce created', id });
        } catch (error: any) {
          console.error('Error creating item:', error);
          res.status(500).json({ 
            error: 'Failed to create item',
            details: error.message || error 
          });
        }
        break;
      }
      case 'GET': {
        const { page, perPage, searchTerm } = req.query;
        
        // If pagination parameters are provided, handle pagination
        if (page && perPage) {
          const pageNumber = parseInt(page as string, 10) || 1;
          const perPageNumber = parseInt(perPage as string, 10) || 10;
          const searchTermStr = (searchTerm as string) || '';
          
          try {
            // Get all items first
            const allItems = await getItemAcces();
            
            // Filter items if search term is provided
            let filteredItems = allItems;
            if (searchTermStr) {
              const searchTermLower = searchTermStr.toLowerCase();
              filteredItems = allItems.filter((item: any) => {
                return (
                  item.code?.toString().toLowerCase().includes(searchTermLower) ||
                  item.category?.toLowerCase().includes(searchTermLower) ||
                  item.brand?.toLowerCase().includes(searchTermLower) ||
                  item.model?.toLowerCase().includes(searchTermLower) ||
                  (item.brand + ' ' + item.model)?.toLowerCase().includes(searchTermLower) ||
                  (item.category + ' ' + item.brand + ' ' + item.model)?.toLowerCase().includes(searchTermLower) ||
                  (item.category + ' ' + item.model + ' ' + item.brand)?.toLowerCase().includes(searchTermLower)
                );
              });
            }
            
            // Sort by code in descending order
            filteredItems.sort((a: any, b: any) => {
              const aCode = parseInt(a.code?.toString() || '0', 10);
              const bCode = parseInt(b.code?.toString() || '0', 10);
              return bCode - aCode;
            });
            
            // Implement pagination
            const startIndex = (pageNumber - 1) * perPageNumber;
            const endIndex = startIndex + perPageNumber;
            const paginatedItems = filteredItems.slice(startIndex, endIndex);
            
            // Calculate pagination info
            const totalItems = filteredItems.length;
            const totalPages = Math.ceil(totalItems / perPageNumber);
            const hasNextPage = pageNumber < totalPages;
            const hasPrevPage = pageNumber > 1;
            
            res.status(200).json({
              data: paginatedItems,
              pagination: {
                currentPage: pageNumber,
                perPage: perPageNumber,
                totalItems,
                totalPages,
                hasNextPage,
                hasPrevPage
              },
              lastDoc: hasNextPage ? endIndex : null
            });
          } catch (error) {
            console.error('Error fetching paginated items:', error);
            res.status(500).json({ error: 'Failed to fetch items' });
          }
        } else {
          // Return all items without pagination
          const ItemAcces = await getItemAcces();
          res.status(200).json(ItemAcces);
        }
        break;
      }
      case 'PUT': {
        const { id, type, mobileType, category, model, quantity, brand, reorderLevel, description, code, status,warranty } = req.body;
        if (!id || !model) {
          res.status(400).json({ error: 'Item Acce ID and model number are required' });
          return;
        }
        await updateItemAcce(id, type, mobileType, category, model, quantity, brand, reorderLevel, description, code, status,warranty);
        res.status(200).json({ message: 'Item Acce updated' });
        break;
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'Item Acce ID is required' });
          return;
        }
        await deleteItemAcce(id);
        res.status(200).json({ message: 'Item Acce deleted' });
        break;
      }
      default: {
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred', });
  }
}
