function Title({children, level = 1, className = ''}){
    const Tag = `h${level}`
    return (
        <Tag
            className={`title title-h${level} ${className}`}>
            {children}
        </Tag>
    )
}

export default Title

