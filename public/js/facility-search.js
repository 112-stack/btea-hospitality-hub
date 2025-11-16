/**
 * Facility Search Functionality
 */

$(document).ready(function() {
    const searchInput = $('#facilitySearchInput');
    const clearBtn = $('#clearSearchBtn');
    const facilitiesList = $('#facilitiesList');
    const noResultsMsg = $('#noResultsMsg');
    const searchResultCount = $('#searchResultCount');
    const facilityItems = $('.facility-item');

    /**
     * Search facilities
     */
    searchInput.on('input', function() {
        const searchTerm = $(this).val().toLowerCase().trim();

        // Show/hide clear button
        clearBtn.toggle(searchTerm.length > 0);

        let visibleCount = 0;

        // Filter facilities
        facilityItems.each(function() {
            const searchText = $(this).data('search-text') || '';
            const isMatch = searchText.toLowerCase().includes(searchTerm);

            $(this).toggle(isMatch);
            if (isMatch) visibleCount++;
        });

        // Update result count
        if (searchTerm.length > 0) {
            searchResultCount.text(`Found ${visibleCount} result(s)`);
        } else {
            searchResultCount.text('');
        }

        // Show/hide no results message
        if (visibleCount === 0 && searchTerm.length > 0) {
            facilitiesList.hide();
            noResultsMsg.show();
        } else {
            facilitiesList.show();
            noResultsMsg.hide();
        }
    });

    /**
     * Clear search
     */
    clearBtn.on('click', function(e) {
        e.stopPropagation();
        searchInput.val('').trigger('input').focus();
    });

    /**
     * Focus search when dropdown opens
     */
    $('.dropdown-toggle').on('shown.bs.dropdown', function() {
        setTimeout(() => searchInput.focus(), 100);
    });

    /**
     * Clear search when dropdown closes
     */
    $('.dropdown-menu').on('hidden.bs.dropdown', function() {
        searchInput.val('').trigger('input');
    });

    /**
     * Prevent dropdown close on search input click
     */
    searchInput.on('click', function(e) {
        e.stopPropagation();
    });

    /**
     * Prevent dropdown close on clear button mousedown
     */
    clearBtn.on('mousedown', function(e) {
        e.stopPropagation();
    });
});

/**
 * Copy to clipboard functionality
 */
$(document).ready(function() {
    $('.copy-btn').on('click', async function() {
        const text = $(this).data('copy-text')?.trim() || '';

        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            const btn = $(this);
            const originalHtml = btn.html();

            btn.html('<i class="fa fa-check text-success"></i>');
            setTimeout(() => btn.html(originalHtml), 1200);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    });
});
