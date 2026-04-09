import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getSiteConfig(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    let config = await prisma.siteConfig.findUnique({ where: { tenantId } });
    if (!config) {
      config = await prisma.siteConfig.create({ data: { tenantId } });
    }
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
}

export async function updateSiteConfig(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId!;
    const {
      siteName, logo, phone, email, address, socialLinks, theme, currency,
      heroBanner, benefits, shippingOptions, servicioTecnico, faq,
      aboutPage, contactPage, instagramSection, promoBanner, footerDescription,
    } = req.body;

    let config = await prisma.siteConfig.findUnique({ where: { tenantId } });

    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          tenantId, siteName, logo, phone, email, address, socialLinks, theme,
          currency, heroBanner, benefits, shippingOptions, servicioTecnico, faq,
          aboutPage, contactPage, instagramSection, promoBanner, footerDescription,
        },
      });
    } else {
      const data: any = {};
      if (siteName !== undefined) data.siteName = siteName;
      if (logo !== undefined) data.logo = logo;
      if (phone !== undefined) data.phone = phone;
      if (email !== undefined) data.email = email;
      if (address !== undefined) data.address = address;
      if (socialLinks !== undefined) data.socialLinks = socialLinks;
      if (theme !== undefined) data.theme = theme;
      if (currency !== undefined) data.currency = currency;
      if (heroBanner !== undefined) data.heroBanner = heroBanner;
      if (benefits !== undefined) data.benefits = benefits;
      if (shippingOptions !== undefined) data.shippingOptions = shippingOptions;
      if (servicioTecnico !== undefined) data.servicioTecnico = servicioTecnico;
      if (faq !== undefined) data.faq = faq;
      if (aboutPage !== undefined) data.aboutPage = aboutPage;
      if (contactPage !== undefined) data.contactPage = contactPage;
      if (instagramSection !== undefined) data.instagramSection = instagramSection;
      if (promoBanner !== undefined) data.promoBanner = promoBanner;
      if (footerDescription !== undefined) data.footerDescription = footerDescription;

      config = await prisma.siteConfig.update({ where: { tenantId }, data });
    }

    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
}
