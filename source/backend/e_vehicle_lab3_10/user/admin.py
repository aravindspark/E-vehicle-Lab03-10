
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # Fields to display in the admin list view
    list_display = ('email', 'firstname', 'lastname', 'user_type', 'is_staff', )
    # Fields that can be directly edited in the list view
    list_editable = ('is_staff',)
    # Fields to search in the search bar
    search_fields = ('email', 'firstname', 'lastname', 'phone_number')
    # Fields for filtering the list
    list_filter = ('user_type',)

    # Define field groups for the admin detail view
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('firstname', 'lastname', 'midname', 'phone_number', 'birth_date')}),
        ('Permissions', {'fields': ('is_superuser', 'user_type')}),
        ('Important Dates', {'fields': ('last_login',)}),
    )

    # Field order for the user creation form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'firstname', 'lastname', 'user_type')}
        ),
    )

    # Use email as the identifier field
    ordering = ('email',)

# Register the model and custom admin class
admin.site.register(CustomUser, CustomUserAdmin)