import { redirect } from 'next/navigation'
import ProductsPagination from "@/components/products/ProductsPagination";
import ProductTable from "@/components/products/ProductsTable";
import Heading from "@/components/ui/Heading";
import { prisma } from "@/src/lib/prisma";
import Link from 'next/link';
import ProductSearchForm from '@/components/products/ProductSearchForm';

async function productCount() {
    return await prisma.product.count()
}
async function getProducts(page: number, pageSize: number) {

    const skip = (page - 1) * pageSize

    const products = await prisma.product.findMany({
        take: pageSize,
        skip,
        include: {
            category: true
        }
    })
    return products
}

export type ProductsWithCategory = Awaited<ReturnType<typeof getProducts>>

export default async function Productspage({searchParams} : { searchParams: {page: string}}) {

    const page = +searchParams.page || 1
    const pageSize = 20

    if(page < 0) redirect('/admin/products')

    const productsData = await getProducts(page, pageSize)
    const totalProductosData = await productCount()
    const [ products, totalProducts] = await Promise.all([productsData, totalProductosData])
    const totalPages = Math.ceil(totalProducts / pageSize)

    if(page > totalPages) redirect('/admin/products')

    return(
        <>
            <Heading>Administrar productos</Heading>

            <div className='flex flex-col lg:flex-row lg:justify-between gap-5'>
                <Link
                    href={'/admin/products/new'}
                    className='bg-amber-400 w-full lg:w-auto text-xl px-10 py-3 text-center font-bold cursor-pointer'
                >Crear Producto</Link>

                <ProductSearchForm />
            </div>

            <ProductTable 
                products={products}
            />

            <ProductsPagination
                page={page}
                totalPages={totalPages}
            />
        </>
    )
}