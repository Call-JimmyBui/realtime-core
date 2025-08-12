import { Product } from '@/apis/product/schemas/product.schema';
import { AppModule } from '@/app.module';
import { Logger } from '@/helpers/loggerHelper';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ProductModel = app.get(getModelToken(Product.name));

  try {
    // Xóa collection
    const collections = await ProductModel.db.db.listCollections({ name: ProductModel.collection.name }).toArray();
    if (collections.length > 0) {
      await ProductModel.collection.drop();
      console.log(`Đã drop collection "${ProductModel.collection.name}"`);
    }

    // Danh sách sản phẩm mẫu 
    const productsToInsert = [
      {
        name: 'Áo sơ mi đồng phục công ty',
        description: 'Áo sơ mi vải Kate, thiết kế đơn giản, lịch sự, phù hợp cho môi trường văn phòng.',
        price: 250000,
        stock: 200,
      },
      {
        name: 'Quần tây nam đồng phục',
        description: 'Quần tây chất liệu vải co giãn, form slim-fit, mang lại cảm giác thoải mái khi mặc.',
        price: 380000,
        stock: 150,
      },
      {
        name: 'Chân váy đồng phục nữ',
        description: 'Chân váy chữ A, chất liệu tuyết mưa, có lót trong, chống nhăn tốt.',
        price: 280000,
        stock: 180,
      },
      {
        name: 'Áo thun polo đồng phục',
        description: 'Áo thun polo vải cá sấu cao cấp, thấm hút mồ hôi, logo thêu sắc nét.',
        price: 180000,
        stock: 300,
      },
      {
        name: 'Áo khoác gió đồng phục',
        description: 'Áo khoác gió 2 lớp, chống thấm nước nhẹ, giữ ấm tốt, có thể in logo tùy chỉnh.',
        price: 450000,
        stock: 100,
      },
      {
        name: 'Mũ lưỡi trai đồng phục',
        description: 'Mũ lưỡi trai vải kaki, form chuẩn, khóa kim loại chắc chắn.',
        price: 80000,
        stock: 250,
      },
      {
        name: 'Áo blouse y tế',
        description: 'Áo blouse trắng, chất liệu vải cotton pha, kháng khuẩn, dễ giặt ủi.',
        price: 320000,
        stock: 120,
      },
      {
        name: 'Đồng phục công nhân',
        description: 'Bộ quần áo công nhân vải kaki dày dặn, có túi hộp tiện lợi.',
        price: 550000,
        stock: 80,
      },
      {
        name: 'Đồng phục học sinh cấp 1',
        description: 'Bộ đồng phục gồm áo trắng và quần xanh, chất liệu vải mềm mại, an toàn cho trẻ.',
        price: 200000,
        stock: 220,
      },
      {
        name: 'Giày búp bê nữ đồng phục',
        description: 'Giày búp bê da mềm, đế cao su chống trượt, phù hợp cho học sinh.',
        price: 210000,
        stock: 140,
      },
    ];

    const result = await ProductModel.insertMany(productsToInsert);
    Logger.info(`✅ Đã chèn thành công ${result.length} sản phẩm.`);
  } catch (error) {
    Logger.info('❌ Lỗi khi insert sản phẩm:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
