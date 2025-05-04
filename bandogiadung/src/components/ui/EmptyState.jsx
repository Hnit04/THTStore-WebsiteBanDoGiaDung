import { Link } from "react-router-dom"

function EmptyState({ title, description, icon, actionText, actionHref }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg shadow-md text-center">
            <div className="mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-md">{description}</p>
            {actionText && actionHref && (
                <Link
                    to={actionHref}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-all"
                >
                    {actionText}
                </Link>
            )}
        </div>
    )
}

export default EmptyState
