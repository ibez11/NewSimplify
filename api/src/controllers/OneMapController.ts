import { Request, Response, NextFunction } from 'express';
import { Controller, Get } from '../overnightjs/core/lib/decorators';
import { OK } from 'http-status-codes';
import * as OneMapService from '../services/OneMapService';

@Controller('api/onemap')
export class OneMapController {
  @Get('search/:postalCode')
  private async searchAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { postalCode } = req.params;
      if (!postalCode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid postal code format. Please provide a postal code.'
        });
      }

      const addresses = await OneMapService.searchAddress(postalCode);
      res.status(OK).json({
        success: true,
        data: addresses
      });
    } catch (error) {
      console.error('Error searching address:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search addresses'
      });
    }
    return res;
  }
}
