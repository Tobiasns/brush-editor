import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PagerService {
    getPager(
        totalItems: number,
        currentPage: number = 1,
        pageSize: number = 10
    ) {
        // Calculate total pages
        const totalPages = Math.ceil(totalItems / pageSize);

        // Ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage: number, endPage: number;
        if (totalPages <= 10) {
            // Less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // More than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // Calculate start and end item indexes
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // Create an array of pages to ng-repeat in the pager control
        // tslint:disable-next-line:prefer-const
        let pages = Array.from(Array(endPage + 1 - startPage).keys()).map(
            i => startPage + i
        );

        // Return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages,
        };
    }
}
