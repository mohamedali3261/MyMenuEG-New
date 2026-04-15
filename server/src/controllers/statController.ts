import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getStats = async (req: any, res: Response) => {
  try {
    const [totalSalesRes, totalOrders, totalProducts, totalCustomersRes] = await Promise.all([
      prisma.orders.aggregate({
        _sum: { total_price: true },
        where: { status: 'delivered' }
      }),
      prisma.orders.count(),
      prisma.products.count(),
      prisma.orders.groupBy({
        by: ['phone'],
        _count: { _all: true }
      })
    ]);

    const arDays: any = {
      'Sun': 'الأحد',
      'Mon': 'الاثنين',
      'Tue': 'الثلاثاء',
      'Wed': 'الأربعاء',
      'Thu': 'الخميس',
      'Fri' : 'الجمعة',
      'Sat': 'السبت'
    };

    const salesChart = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);

      const dayShortEn = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNameAr = arDays[dayShortEn] || dayShortEn;

      const [daySalesRes, dayOrderCount] = await Promise.all([
        prisma.orders.aggregate({
          _sum: { total_price: true },
          where: {
            status: 'delivered',
            created_at: {
              gte: d,
              lt: nextDay
            }
          }
        }),
        prisma.orders.count({
          where: {
            created_at: {
              gte: d,
              lt: nextDay
            }
          }
        })
      ]);

      salesChart.push({
        name: dayNameAr,
        sales: daySalesRes._sum.total_price || 0,
        orders: dayOrderCount
      });
    }

    res.json({
      totalSales: totalSalesRes._sum.total_price || 0,
      totalOrders,
      totalProducts,
      totalCustomers: totalCustomersRes.length,
      salesChart
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
